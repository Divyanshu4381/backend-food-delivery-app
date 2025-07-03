import Order from "../models/order.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";

const generateOrderId = () => {
  const timestamp = Date.now();
  return `ORD-${timestamp}`;
};

export const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    deliveryLocation,
    discount = 0,
    paymentMethod,
    paymentId,
  } = req.body;

  const customerId = req.user?._id;

  if (!customerId) {
    throw new ApiError(404, "Customer not found");
  }

  if (!orderItems || orderItems.length === 0) {
    throw new ApiError(400, "Order items are required");
  }

  // ✅ Step 1: Get all product details
  const productIds = orderItems.map((item) => item.productId);
  const products = await Product.find(
    { _id: { $in: productIds } },
    "_id price Frenchies"
  );

  if (products.length !== orderItems.length) {
    throw new ApiError(400, "One or more products not found");
  }
  // ✅ Step 2: Ensure all products are from same Frenchies
  const uniqueFrenchiesIds = [
    ...new Set(
      products.map((p) => {
        if (!p.Frenchies) {
          throw new ApiError(400, `Product ${p._id} has no Frenchies`);
        }
        return p.Frenchies.toString();
      })
    ),
  ];


  if (uniqueFrenchiesIds.length !== 1) {
    throw new ApiError(400, "All products in order must belong to the same Frenchies");
  }

  const frenchiesId = uniqueFrenchiesIds[0];

  // ✅ Step 3: Attach correct price from DB into orderItems
  const finalOrderItems = orderItems.map((item) => {
    const product = products.find((p) => p._id.toString() === item.productId);
    return {
      productId: item.productId,
      quantity: item.quantity,
      price: product.price,
    };
  });

  // ✅ Step 4: Calculate Amount and TotalAmount
  const calculatedAmount = finalOrderItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const finalTotalAmount = calculatedAmount - discount;

  if (finalTotalAmount < 0) {
    throw new ApiError(400, "Total amount cannot be negative after discount");
  }

  // ✅ Step 5: Create Order
  const newOrder = await Order.create({
    orderId: generateOrderId(),
    customerId,
    frenchiesId,
    orderItems: finalOrderItems,
    deliveryLocation,
    amount: calculatedAmount,
    discount,
    totalAmount: finalTotalAmount,
    paymentMethod,
    paymentId,
    statusHistory: [
      {
        status: "confirmed",
        timestamp: new Date(),
      },
    ],
  });
  await Cart.findOneAndDelete({ userId });

  return res
    .status(201)
    .json(new ApiResponse(201, newOrder, "Order created successfully"));
});
