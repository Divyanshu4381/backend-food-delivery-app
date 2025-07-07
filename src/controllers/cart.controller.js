import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ✅ Add or Create Cart Item
export const addToCart = asyncHandler(async (req, res) => {
  const customerId = req.user?._id;
  const productId = req.params.productId;
  const { quantity } = req.body;

  if (!productId || !quantity) {
    throw new ApiError(400, "Product ID and quantity are required");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  let cart = await Cart.findOne({ customerId });
  if (!cart) {
    cart = new Cart({ customerId, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.productId.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      productId,
      quantity,
      priceAtTime: product.price,
    });
  }

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Product added to cart successfully"));
});


// ✅ Update Cart Item Quantity
export const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const customerId = req.user?._id;
  const productId = req.params.productId;
  const { quantity } = req.body;

  if (!productId || quantity == null) {
    throw new ApiError(400, "Product ID and new quantity are required");
  }

  const cart = await Cart.findOne({ customerId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.find(
    (item) => item.productId.toString() === productId
  );

  if (!item) {
    throw new ApiError(404, "Product not found in cart");
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    );
  } else {
    item.quantity = quantity;
  }

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart item updated successfully"));
});

// ✅ Remove Single Product from Cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const customerId = req.user?._id;
  const productId = req.params.productId;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const cart = await Cart.findOne({ customerId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = cart.items.filter(
    (item) => item.productId.toString() !== productId
  );

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Product removed from cart"));
});

// ✅ Clear Entire Cart
export const clearCart = asyncHandler(async (req, res) => {
  const customerId = req.user?._id;

  const cart = await Cart.findOne({ customerId });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = [];
  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart cleared successfully"));
});

// ✅ Get Current User Cart
export const getCart = asyncHandler(async (req, res) => {
  const customerId = req.user?._id;

  const cart = await Cart.findOne({ customerId }).populate("items.productId");

  if (!cart) {
    return res
      .status(200)
      .json(new ApiResponse(200, [], "Cart is empty"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart fetched successfully"));
});
