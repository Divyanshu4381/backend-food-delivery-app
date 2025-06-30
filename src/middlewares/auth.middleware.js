import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");


    if (!token) {
        throw new ApiError(401, "Unauthorized request - Token missing");
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.user = decodedToken;  
        next();
    } catch (error) {
        throw new ApiError(401, "Invalid or expired token");
    }
});




export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "You are not authorized" });
        }
        next();
    };
};