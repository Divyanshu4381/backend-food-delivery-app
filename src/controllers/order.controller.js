import Order from "../models/order.model";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";
const generateOrderId = () => {
  const timestamp = Date.now();
  return `ORD-${timestamp}`;
};
const createOrder=asyncHandler(async(req,res)=>{
    const {
    orderItems,
    deliveryLocation,
    amount,
    discount,
    totalAmount,
    paymentMethod,
    paymentId,
  } = req.body;
  const {customerId}=req.user?.id
  if(!customerId){
    throw new ApiError(
        404,"Customer not found"
    )
  }

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'Order items are required' });
  }
  const newOrder = await Order.create({
    orderId: generateOrderId(),
    customerId,
    frenchiesId,
    orderItems,
    deliveryLocation,
    amount,
    discount,
    totalAmount,
    paymentMethod,
    paymentId,
    statusHistory: [
      {
        status: "confirmed",
        timestamp: new Date(),
      },
    ],
  });

  return res.status(201).json(
    new ApiResponse(201, newOrder, "Order created successfully")
  );
});

