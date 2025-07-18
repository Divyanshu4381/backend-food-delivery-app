import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import asyncHandler from "../utils/asyncHandler";


import Order from "../models/order.model.js";
import { Delivery_Boy, Frenchies } from "../models/user.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

export const assignOrderToDeliveryBoy = asyncHandler(async (req, res) => {
    const { orderId, deliveryBoyID } = req.body;

    if (!orderId || !deliveryBoyID) {
        throw new ApiError(400, "Order ID and Delivery Boy ID are required");
    }

    const order = await Order.findOne({ orderId });
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const deliveryBoy = await Delivery_Boy.findOne({ deliveryBoyID });
    if (!deliveryBoy || !deliveryBoy.isActivated) {
        throw new ApiError(404, "Valid & active Delivery Boy not found");
    }

    if (req.user.role === "frenchies") {
        if (order.frenchiesId.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You can assign orders only from your own franchise");
        }
    }

    order.deliveryBoyId = deliveryBoy._id;
    order.orderStatus = "outForDelivery";
    order.statusHistory.push({
        status: "outForDelivery",
        timestamp: new Date(),
    });
    await order.save();



    deliveryBoy.orders.push(order._id);
    deliveryBoy.totalOrder += 1;
    deliveryBoy.pendingOrder += 1;
    deliveryBoy.isAvailable = false;
    await deliveryBoy.save();

    return res.status(200).json(
        new ApiResponse(200, { order }, "Order assigned to Delivery Boy successfully")
    );
});



// devivery body orders
export const statusOrderByDeliveryBoy = asyncHandler(async (req, res) => {
    const { orderId, orderStatus } = req.body;
    const deliveryBoyID = req.user._id
    const order = await Order.findOne({ orderId })
    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    order.orderStatus.push({
        orderStatus,
        timestamp: new Date(),

    })
    await order.save();

    const deliveryBoy = await Delivery_Boy.findById({ deliveryBoyID });
    if (!deliveryBoy || !deliveryBoy.isActivated) {
        throw new ApiError(404, "Valid & active Delivery Boy not found");

    }
    deliveryBoy.completeOrder += 1;
    // deliveryBoy.totalOrder -= 1;
    deliveryBoy.pendingOrder -= 1;
    await deliveryBoy.save();

    return res.status(200).json(
        new ApiResponse(200, { order }, "Order assigned to Delivery Boy successfully")
    );

})


export const statusDeliveryBoy = asyncHandler(async (req, res) => {
    const deliveryBoyID = req.user._id;
    const { isAvailable } = req.body;
    const deliveryBoy = await Delivery_Boy.findById({ deliveryBoyID });
    if (!deliveryBoy || !deliveryBoy.isActivated) {
        throw new ApiError(404, "Valid & active Delivery Boy not found");

    }
    deliveryBoy.isAvailable = !deliveryBoy.isAvailable;
    await deliveryBoy.save();
    return res.status(200).json(
        new ApiResponse(200, { deliveryBoy }, "Order assigned to Delivery Boy successfully")
    );

})