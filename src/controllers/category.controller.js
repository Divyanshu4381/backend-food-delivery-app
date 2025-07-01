import { Category } from "../models/category.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

export const createCategory = asyncHandler(async (req, res) => {
    const { name, image } = req.body;

    if (!name) {
        throw new ApiError(400, "Category name is required");
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        throw new ApiError(400, "Category with this name already exists");
    }

    const category = await Category.create({ name, image });

    return res
        .status(201)
        .json(new ApiResponse(201, category, "Category created successfully"));
});


export const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true });

    return res
        .status(200)
        .json(new ApiResponse(200, categories, "Categories fetched successfully"));
});

export const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, image, } = req.body;

    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    // Update fields if provided
    if (name) category.name = name;
    if (image) category.image = image;

    await category.save();

    return res
        .status(200)
        .json(new ApiResponse(200, category, "Category updated successfully"));
});

export const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
        throw new ApiError(404, "Category not found");
    }

    category.isActive = false;
    await category.save();

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Category deleted (soft delete) successfully"));
});

