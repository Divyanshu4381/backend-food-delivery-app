import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true
    },
    description: {
        type: String,
    },
    image: {
        type: String,
        required: [true, "Product image URL is required"]
    },
    discount: {
        type: String
    },
    discountCoupon: {
        type: String
    },
    price: {
        type: Number,
        required: [true, "Product price is required"]
    },

    stock: {
        type: String,
        enum: ["In Stock", "Out Stock"],
        default: "In Stock"
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",   // Category Model (Ex: Burger, Drinks)
    },
    Frenchies: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Frenchies",
        required: true
    },
    toppings: {
        type: [String],
        default: [],
    },


}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
