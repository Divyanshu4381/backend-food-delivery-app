import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js"
import { Product } from "../models/product.model.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import mongoose from "mongoose";
export const createProduct=asyncHandler(async(req,res)=>{
    const {name,description,price, stock,category     
    } = req.body;
    if (!name || !price || !category ) {
        throw new ApiError(400, "Product name, image, price, category, and Frenchies are required");
    }
    const frenchiesId =req.user?._id;
    if(!frenchiesId){
        throw new ApiError(404,"Frenchies not found")
    }

    const imageLocalPath = req.file?.path;
    if (!imageLocalPath) {
        throw new ApiError(400, "Image is required")
    }
    const image = await uploadOnCloudinary(imageLocalPath)
    if(!image.url){
        throw new ApiError(400,"image upload failed")
    }
    const product = await Product.create({
        name,
        description,
        image:image.url,
        price,
        stock,
        category,
        Frenchies:frenchiesId,
    });
return res.status(201).json(
        new ApiResponse(201, product, "Product created successfully")
    );


})


export const getAllProducts = asyncHandler(async (req, res) => {
    const { category, Frenchies } = req.query;

    let filter = {};

    if (category) filter.category = category;
    if (Frenchies) filter.Frenchies = Frenchies;

    const products = await Product.find(filter).populate("category").populate("Frenchies");

    return res
        .status(200)
        .json(new ApiResponse(200, products, "Products fetched successfully"));
});

export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    // ✅ ObjectId Validation for category and Frenchies
    if (req.body.category && !mongoose.Types.ObjectId.isValid(req.body.category)) {
        throw new ApiError(400, "Invalid category ID");
    }

    if (req.body.Frenchies && !mongoose.Types.ObjectId.isValid(req.body.Frenchies)) {
        throw new ApiError(400, "Invalid Frenchies ID");
    }

    const updatableFields = [
        "name",
        "description",
        "image",
        "price",
        "stock",
        "category",
        
    ];

    updatableFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            product[field] = req.body[field];
        }
    });

    await product.save();

    return res
        .status(200)
        .json(new ApiResponse(200, product, "Product updated successfully"));
});


// ✅ Delete Product (Soft Delete - Mark isAvailable as false)
export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    product.isAvailable = false;
    await product.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Product deleted (soft delete) successfully"));
});

export const getProductById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const product = await Product.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(id) }  // ✅ Match by ID
        },
        {
            $lookup: {
                from: "categories",                      // ✅ Replace with your actual collection name
                localField: "category",
                foreignField: "_id",
                as: "categoryDetails"
            }
        },
        {
            $lookup: {
                from: "frenchies",                       // ✅ Replace with your actual collection name
                localField: "Frenchies",
                foreignField: "_id",
                as: "frenchiesDetails"
            }
        },
        {
            $unwind: {
                path: "$categoryDetails",
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $unwind: {
                path: "$frenchiesDetails",
                preserveNullAndEmptyArrays: true
            }
        }
    ]);

    if (!product || product.length === 0) {
        throw new ApiError(404, "Product not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, product[0], "Product fetched successfully"));
});
