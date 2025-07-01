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
    price: {
        type: Number,
        required: [true, "Product price is required"]
    },
    discountPrice: {
        type: Number,
        default: 0
    },
    quantityAvailable: {
        type: Number,
        default: 0
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",   // Category Model (Ex: Burger, Drinks)
        required: true
    },
    Frenchies: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Frenchies", 
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    preparationTime: {
        type: Number,
        default: 10, // Minutes
        min: 1
    },
    rating: {
        type: Number,
        default: 0
    },
    

    gst: {
        type: Number,
        default: 5 // Example: 5% GST
    }
}, { timestamps: true });

export const Product = mongoose.model('Product', productSchema);
