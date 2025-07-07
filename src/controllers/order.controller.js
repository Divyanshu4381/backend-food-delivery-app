import Order from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { Frenchies, SuperAdmin } from "../models/user.model.js";


// order handle by Controller
export const placeOrder = asyncHandler(async (req, res) => {
  const customerId = req.user._id;
  const {
    customerName,
    discountCoupon,
    discount,
    deliveryLocation,
    paymentMethod,
    paymentId
  } = req.body;

  if (!customerName || !deliveryLocation || !paymentMethod) {
    throw new ApiError(400, "customerName, deliveryLocation and paymentMethod are required");
  }

  if (paymentMethod === "online" && !paymentId) {
    throw new ApiError(400, "Payment ID is required for online payments.");
  }

  const cart = await Cart.findOne({ customerId }).populate("items.productId");

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

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

  const totalAmount = discountCoupon === productCoupon
    ? amount - discount
    : amount;

  const newOrder = await Order.create({
    orderId: "ORD" + Date.now(),
    customerName,
    customerId,
    frenchiesId,
    orderItems,
    deliveryLocation,
    discount,
    amount,
    totalAmount,
    paymentMethod,
    paymentId: paymentMethod === "online" ? paymentId : null,
    paymentStatus: paymentMethod === "COD" ? "pending" : "success",
    statusHistory: [{ status: "confirmed", timestamp: new Date() }],
  });

  await Cart.findOneAndDelete({ customerId });

  await Frenchies.findByIdAndUpdate(
    frenchiesId,
    {
      $addToSet: {
        customers: customerId,
        orders: newOrder._id
      }
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






export const fetchOrderBySuperAdmin = asyncHandler(async (req, res) => {
  const frenchiesID = req.params.id;

  if (!frenchiesID) {
    throw new ApiError(400, "Frenchies ID is required in URL.");
  }

  // Step 1: Find Frenchies with orders populated (with nested population)
  const frenchies = await Frenchies.findById(frenchiesID).populate({
    path: "orders",
    model: "Order",
    populate: [
      {
        path: "customerId",
        model: "User",
        select: "name phone"
      },
      {
        path: "orderItems.productId",
        model: "Product",
        select: "name image"
      }
    ]
  });

  if (!frenchies || !frenchies.orders) {
    throw new ApiError(404, "Frenchies or orders not found.");
  }

  const originalOrders = frenchies.orders;

  if (originalOrders.length === 0) {
    throw new ApiError(404, "No orders found for this Frenchies.");
  }

  // Step 2: Modify each order to keep only name & image inside orderItems
  const modifiedOrders = originalOrders.map(order => {
    const modifiedItems = order.orderItems.map(item => ({
      _id: item._id,
      quantity: item.quantity,
      price: item.price,
      name: item.productId?.name || "",
      image: item.productId?.image || ""
    }));

    return {
      ...order._doc,
      orderItems: modifiedItems
    };
  });

  return res.status(200).json(
    new ApiResponse(200, modifiedOrders, "Orders fetched successfully")
  );
});
