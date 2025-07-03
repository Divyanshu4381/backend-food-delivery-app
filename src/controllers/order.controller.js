import Order from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

export const placeOrder = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const {discount, deliveryLocation, paymentMethod, paymentId } = req.body;

  const cart = await Cart.findOne({ customerId }).populate("items.productId");

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // Find Frenchies from first item (assuming all products same Frenchies)
  const frenchiesId = cart.items[0].productId.Frenchies;

  const orderItems = cart.items.map((item) => ({
    productId: item.productId._id,
    quantity: item.quantity,
    price: item.priceAtTime,
  }));

  const amount = orderItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );

  const totalAmount = amount-discount; // for now no discount logic

  const newOrder = await Order.create({
    orderId: "ORD" + Date.now(),
    customerId,
    frenchiesId,
    orderItems,
    deliveryLocation, // {coordinates, address, landmark}
    discount,
    amount,
    totalAmount,
    paymentMethod,
    paymentId: paymentId || null,
    paymentStatus: paymentMethod === "COD" ? "pending" : "success",
    statusHistory: [{ status: "confirmed", timestamp: new Date() }],
  });

  // Clear cart after order placed
  await Cart.findOneAndDelete({ customerId  });


  return res.status(201).json(
    new ApiResponse(201, newOrder, "Order placed successfully")
  );
});
