import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Frenchies, User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { SuperAdmin } from "../models/user.model.js";
import jwt from 'jsonwebtoken'
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async (userId, role) => {

    try {
        let user;

        if (role === "superAdmin") {
            user = await SuperAdmin.findById(userId);
        } else if (role === "frenchies") {
            user = await Frenchies.findById(userId);
        } else if (role === "user") {
            user = await User.findById(userId);
        } else {
            throw new ApiError(400, "Invalid user role for token generation");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

export const generateFrenchiesID = async (cityName) => {
    const city = cityName.trim().toUpperCase();

    // Count existing frenchies for this city
    const count = await Frenchies.countDocuments({ address: { $regex: city, $options: 'i' } });

    // Next number
    const nextNumber = (count + 1).toString().padStart(3, '0');  // Eg: 001, 002, 003

    // Final Frenchies ID
    const frenchiesID = `${city}-${nextNumber}`;

    return frenchiesID;
};

export const registerSuperAdmin = asyncHandler(async (req, res) => {
    const { phone, email, password } = req.body;

    //  Field validation
    if (!phone || !email || !password) {
        throw new ApiError(400, "Phone, Email and Password are required");
    }

    // Check if SuperAdmin already exists
    const existingAdmin = await SuperAdmin.findOne({
        $or: [{ phone }, { email }]
    });

    if (existingAdmin) {
        throw new ApiError(400, "SuperAdmin already exists with this phone or email");
    }

    // Create new SuperAdmin
    const newAdmin = await SuperAdmin.create({
        phone,
        email,
        password,
        role: "superAdmin"
    });

    return res.status(201).json(
        new ApiResponse(201, { user: newAdmin }, "SuperAdmin registered successfully", true)
    );
});


export const userLogin = asyncHandler(async (req, res) => {
    const { phone, password } = req.body;
    if (!phone) {
        throw new ApiError(404, "phone number is missing")
    }

    // SuperAdmin Login

    let user = await SuperAdmin.findOne({ phone });


    if (user) {
        if (!password) throw new ApiError(400, "Password is required for SuperAdmin");

        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) throw new ApiError(401, "Invalid credentials for SuperAdmin");
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, user.role);

        const loggedInUser = await SuperAdmin.findById(user._id).select("-password -refreshToken");
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            path: '/'
        }
        return res.status(200).cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { user: loggedInUser }, "SuperAdmin Login Successful"));
    }

    // Frenchies Admin Login

    user = await Frenchies.findOne({ phone });

    if (user) {
        if (!password) throw new ApiError(400, "Password is required for Admin");
        const isPasswordValid = await user.isPasswordCorrect(password);
        if (!isPasswordValid) throw new ApiError(401, "Invalid credentials for Frenchies Admin");
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id, user.role);
        console.log(accessToken, refreshToken)
        const loggedInUser = await Frenchies.findById(user._id).select("-password -refreshToken");
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            path: '/'
        }
        return res.status(200).cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { user: loggedInUser,accessToken,
        refreshToken }, "Frenchies Admin Login Successful"));
    }

    // Customer Login
    user = await User.findOne({ phone });

    if (!user) {
        // User doesn't exist, create new customer
        user = await User.create({ phone, role: "customer" });
    }

    const accessToken = jwt.sign({
        _id: user._id,
        phone: user.phone,
        role: user.role

    },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "7d" }
    )
    const refreshToken = jwt.sign({
        _id: user._id,
        phone: user.phone,
        role: user.role

    },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "30d" }
    )
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: '/'
    }
    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200,  "Customer Login Successful",{ user: loggedInUser }));

})



export const frenchiesCreatedByAdmin = asyncHandler(async (req, res) => {
    const { name, phone, email, address, city, state, country } = req.body;
    if (!phone || !email || !address) {
        throw new ApiError(400, "Email and Password is missing")
    }
    const user = await Frenchies.findOne({ phone })
    if (user) {
        throw new ApiError(400, "user already exit")
    }
    const frenchiesID = await generateFrenchiesID(city);

    const newAdmin = await Frenchies.create({
        frenchiesID: frenchiesID,
        frenchieName: name,
        phone,
        email,
        address,
        city,
        state,
        country,
        password: phone,

        role: "frenchies"
    })
    const superAdminId = req.user?._id
    const newFrenchies = await Frenchies.findOne({ frenchiesID });
    await SuperAdmin.findByIdAndUpdate(superAdminId, {
        $push: { frenchies: newFrenchies._id }
    });
    return res.status(201).json(
        new ApiResponse(200, { user: newAdmin }, "Frenchies created successfully", true)

    )


})


export const logout = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const userRole = req.user.role
    let userModel;
    if (userRole === "superAdmin") {
        userModel = SuperAdmin;
    } else if (userRole === "frenchies") {
        userModel = Frenchies;
    } else if (userRole === "customer") {
        userModel = User;
    } else {
        throw new ApiError(400, "Invalid user role");
    }

    const user = await userModel.findById(userId)
    if (!user) {
        throw new ApiError(404, "user not found")
    }
    user.refreshToken = undefined;
    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
        path: '/'
    }
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User Logout Successfully"))

})


export const refereshAccessToken = asyncHandler(async (req, res) => {
    const incomingrefreshToken = req.cookies?.refreshToken || req.body?.refreshToken
    if (!incomingrefreshToken) {
        throw new ApiError(401, "Unauthorized request")

    }
    try {
        const decodedToken = jwt.verify(incomingrefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const { _id, role } = decodedToken;
        let user;
        if (role === "superAdmin") {
            user = await SuperAdmin.findById(_id)
        } else if (role === "frenchies") {
            user = await Frenchies.findById(_id)
        } else if (role === "customer") {
            user = await User.findById(_id);
        } else {
            throw new ApiError(401, "Invalid role in token");
        }
        if (!user) {
            throw new ApiError(401, "User not found with this token");
        }
        if (incomingrefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid refresh token");
        }
        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id, role);
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            path: '/'
        }
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200,
                    { accessToken, refreshToken: newRefreshToken },
                    "Access token refreshed successfully")
            )


    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh Token")
    }
})


// CRUD operation set for frenchie

export const updateDetailsFrenchie = asyncHandler(async (req, res) => {
    const userId = req.user._id
    const { latitude, longitude, address, password } = req.body;

    if (!latitude || !longitude || !password) {
        throw new ApiError(400, "Location and Password are required to update Frenchies details.")
    }
    const user = await Frenchies.findById(userId)
    if (!user) {
        throw new ApiError(404, "Frenchies user not found with the provided ID.")
    }
    user.location.coordinates = [parseFloat(longitude), parseFloat(latitude)];

    if (address) {
        user.address = address;
    }

    user.password = password;
    await user.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            { user },
            "Profile Update Successfully"
        )
    )
})

export const forgetPassword = asyncHandler(async (req, res) => {
    const { email, phone, frenchiesID, password } = req.body;
    if (!email && !phone && !frenchiesID) {
        throw new ApiError(400, "At least one of Email, Phone, or FrenchiesID is required.")
    }
    const user = await Frenchies.findOne({ $or: [{ email }, { phone }, { frenchiesID }] })
    if (!user) {
        throw new ApiError(400, "No Frenchies user found with the provided Email, Phone, or FrenchiesID.");
    }
    if (!password) {
        throw new ApiError(400, "Password is required")
    }
    user.password = password;
    await user.save();
    return res.status(200).json(
        new ApiResponse(
            200,
            password,
            "password forgeted successfully"
        )
    )
})

// CRUD opeation set for SuperAdmin

export const getAllFrenchies = asyncHandler(async (req, res) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const superAdminId = req.user?._id;

    if (!superAdminId) {
        return res.status(400).json({
            success: false,
            message: "SuperAdmin ID missing from request."
        });
    }

    // Step 1: Aggregate pipeline
    const aggregateQuery = SuperAdmin.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(String(superAdminId))
            }
        },
        {
            $lookup: {
                from: "frenchies",
                localField: "frenchies",
                foreignField: "_id",
                as: "frenchiesList"
            }
        },
        {
            $unwind: "$frenchiesList"
        },
        {
            $replaceRoot: { newRoot: "$frenchiesList" }
        }
    ]);

    // Step 2: Pagination Options
    const options = {
        page,
        limit
    };

    // Step 3: Execute Paginated Aggregate Query
    const result = await SuperAdmin.aggregatePaginate(aggregateQuery, options);

    return res.status(200).json({
        success: true,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        currentPage: result.page,
        data: result.docs
    });
});
// get frenchies by id
export const getSingleFrenchies = asyncHandler(async (req, res) => {
    const frenchyId = req.params.id;
    const frenchies = await Frenchies.findById(frenchyId);
    if (!frenchies) {
        throw new ApiError(404, "Frenchies not found");
    }
    return res.status(200).json(new ApiResponse(200, frenchies, "Frenchies fetched successfully"));
});


export const manageFrenchiesBySuperAdmin = asyncHandler(async (req, res) => {
    const { action, frenchiesID, updateData, status } = req.body;
    if (!action || !frenchiesID) {
        throw new ApiError(400, "Action and FrenchiesID are required.");

    }
    const frenchies = await Frenchies.findOne({ frenchiesID })
    if (!frenchies) {
        throw new ApiError(404, "Frenchies not found with this ID.");

    }
    switch (action) {
        case "status":
            if (!status || !["Approved", "Rejected", "Pending"].includes(status)) {
                throw new ApiError(400, "Valid status (Approved, Rejected, Pending) is required.");
            }
            frenchies.status = status;
            await frenchies.save();
            return res.status(200).json(
                new ApiResponse(200, frenchies, `Frenchies status updated to ${status}.`)
            );
        case "toggleStatus":
            frenchies.isActivated = !frenchies.isActivated;
            await frenchies.save();
            return res.status(200).json(
                200, frenchies, `Frenchies Status ${frenchies.isActivated ? "Activated" : "Deactivated"}`
            )
        case "delete":
            await Frenchies.deleteOne({ _id: frenchies._id });
            return res.status(200).json(
                new ApiResponse(200, {}, "Frenchies deleted successfully.")
            );
        case "update":
            if (!updateData || typeof updateData !== "object") {
                throw new ApiError(400, "Update data is missing or invalid.");

            }
            const protectedFields = ["phone", "frenchiesID", "role", "_id"];

            for (const key of Object.keys(updateData)) {
                if (protectedFields.includes(key)) {
                    throw new ApiError(400, `${key} cannot be updated.`);
                }
                frenchies[key] = updateData[key];
            }

            await frenchies.save();
            return res.status(200).json(
                new ApiResponse(200, frenchies, "Frenchies details updated successfully.")
            );

        default:
            throw new ApiError(400, "Invalid action type.");
    }



})


// get user

export const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200).json(
        new ApiResponse(200, req.user, "User fetched successfully")
    )
})
export const getCurrentUserDetails = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    const role = req.user?.role;

    if (!userId || !role) {
        throw new ApiError(401, "Unauthorized: User info missing");
    }

    let user;

    switch (role) {
        case "customer":
            user = await Customer.findById(userId).select("-password");
            break;
        case "frenchies":
            user = await Frenchies.findById(userId).select("-password");
            break;
        case "superAdmin":
            user = await SuperAdmin.findById(userId).select("-password");
            break;
        
        default:
            throw new ApiError(400, "Invalid user role");
    }

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, user, "User details fetched successfully"));
});