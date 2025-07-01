import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js"
import { Product } from "../models/product.model.js";

export const createProduct=asyncHandler(async(req,res)=>{
    const {name,description,image,price,discountPrice, quantityAvailable,category,Frenchies,isAvailable,preparationTime,
        rating,gst
    } = req.body;
    if (!name || !image || !price || !category || !Frenchies) {
        throw new ApiError(400, "Product name, image, price, category, and Frenchies are required");
    }
    const product = await Product.create({
        name,
        description,
        image,
        price,
        discountPrice,
        quantityAvailable,
        category,
        Frenchies,
        isAvailable,
        preparationTime,
        rating,
        gst
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

    const updatableFields = [
        "name",
        "description",
        "image",
        "price",
        "discountPrice",
        "quantityAvailable",
        "category",
        "Frenchies",
        "isAvailable",
        "preparationTime",
        "rating",
        "gst"
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