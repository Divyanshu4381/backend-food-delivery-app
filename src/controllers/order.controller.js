import Order from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Frenchies } from "../models/user.model.js";


// order handle by Controller
export const placeOrder = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const { discountCoupon, deliveryLocation, paymentMethod, paymentId } = req.body;

  const cart = await Cart.findOne({ customerId }).populate("items.productId");

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  // Find Frenchies from first item (assuming all products same Frenchies)
  const frenchiesId = cart.items[0].productId.Frenchies;
  const productCoupon = cart.items[0].productId.discountCoupon;

  const orderItems = cart.items.map((item) => ({
    productId: item.productId._id,
    quantity: item.quantity,
    price: item.priceAtTime,
  }));

  const amount = orderItems.reduce(
    (total, item) => total + item.quantity * item.price,
    0
  );
  let totalAmount;
  const discount = 50
  if (discountCoupon == productCoupon) {

    totalAmount = amount - discount;
  } else {
    totalAmount = amount
  }

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

  await Cart.findOneAndDelete({ customerId });
  await Frenchies.findByIdAndUpdate(
    frenchiesId,
    { $addToSet: { customers: customerId,orders: newOrder._id }
  }
  );
  

  return res.status(201).json(
    new ApiResponse(201, newOrder, "Order placed successfully")
  );
});


export const fetchOrderByCustomer = asyncHandler(async (req, res) => {
  const customerId = req.user?._id;
  if (!customerId) {
    throw new ApiError(401, "Unauthorized: User not found.")
  }
  const orders = await Order.find({ customerId }).sort({ createdAt: -1 });
  if (!orders || orders.length === 0) {
    throw new ApiError(404, "No orders found for this customer.")
  }
  return res.status(200).json(
    new ApiResponse(
      200,
      orders, "Orders fetch successfully"
    )
  )
});

export const cancelOrderByCustomer = asyncHandler(async (req, res) => {
  const customerId = req.user?._id;
  const { orderId } = req.body;

  if (!customerId) {
    throw new ApiError(401, "Unauthorized: Customer not found.");
  }

  if (!orderId) {
    throw new ApiError(400, "Order ID is required.");
  }

  const order = await Order.findOne({ _id: orderId, customerId });

  if (!order) {
    throw new ApiError(404, "Order not found or access denied.");
  }

  if (order.orderStatus === "Cancelled") {
    throw new ApiError(400, "Order is already cancelled.");
  }

  order.orderStatus = "Cancelled";
  await order.save();

  return res.status(200).json(
    new ApiResponse(200, order, "Order cancelled successfully.")
  );
});



// order handle by Frenchies Controller
export const fetchOrderByFrenchies = asyncHandler(async (req, res) => {
  const frenchiesId = req.user?._id;

  if (!frenchiesId) {
    throw new ApiError(401, "Unauthorized: Frenchies  not found.");
  }

  const orders = await Order.find({ frenchiesId })
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, orders, "Orders fetched successfully.")
  );
});
export const manageOrderByFrenchies = asyncHandler(async (req, res) => {
  const frenchiesId = req.user?._id;

  const { orderId, orderStatus, estimatedDeliveryTime } = req.body;

  if (!frenchiesId) {
    throw new ApiError(401, "Unauthorized: Frenchies  not found.");
  }
  if (!orderId) {
    throw new ApiError(400, "Order ID is required to update the order.");
  }
  const order = await Order.findOne({ _id: orderId, frenchiesId });

  if (!order) {
    throw new ApiError(404, "Order not found or access denied.");
  }


  if (orderStatus) frenchiesId.orderStatus = orderStatus;
  if (estimatedDeliveryTime) frenchiesId.estimatedDeliveryTime = estimatedDeliveryTime;


  await order.save();


  return res.status(200).json(
    new ApiResponse(
      200,
      {
        orderId: order._id,
        updatedStatus: order.orderStatus,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
      },
      "Order updated successfully"
    )
  )

});




// order handle by Super Admin Controller


// export const fetchOrderBySuperAdmin = asyncHandler(async (req, res) => {
//   const superAdminId = req.user?._id;
//   if (!superAdminId) {
//     throw new ApiError(401, "Unauthorized: User not found.")
//   }
//   const orders = await Order.find({ superAdminId }).sort({ createdAt: -1 });
//   if (!orders || orders.length === 0) {
//     throw new ApiError(404, "No orders found for this customer.")
//   }
//   return res.status(200).json(
//     new ApiResponse(
//       200,
//       orders, "Orders fetch successfully"
//     )
//   )
// });


