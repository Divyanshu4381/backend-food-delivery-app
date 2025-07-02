import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true,
    },
    frenchiesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Frenchies",
        required: true,
    },
    // deliveryBoyId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "DeliveryBoy",
    // },
    orderItems: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                default: 1,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    deliveryLocation: {
        type: {
            type: String,
            enum: ["Point"],
            default: "Point",
        },
        coordinates: {
            type: [Number],
            required: true,
        },
        address: {
            type: String,
        },
        landmark:{
            type:String
        }
    },
    amount: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        default: 0,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "UPI", "Card", "NetBanking"],
        required: true,
    },
    paymentId: {
        type: String,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
    },
    orderStatus: {
        type: String,
        enum: ["confirmed", "preparing", "outForDelivery", "delivered", "cancelled"],
        default: "confirmed",
    },
    estimatedDeliveryTime: {
        type: Date,
    },
    statusHistory: [
        {
            status: String,
            timestamp: Date,
        },
    ],
},
    {
        timestamps: true,
    });

orderSchema.index({ deliveryLocation: "2dsphere" });



const Order = mongoose.model("Order", orderSchema);
export default Order;
