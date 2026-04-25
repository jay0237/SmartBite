const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Restaurant name is required"],
            trim: true,
        },
        image: {
            type: String,
            required: [true, "Restaurant image is required"],
        },
        cuisine: {
            type: [String],
            required: [true, "Cuisine types are required"],
        },
        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 4.5,
        },
        deliveryTime: {
            type: String,
            required: [true, "Delivery time is required"],
            example: "30-40 min",
        },
        location: {
            type: String,
            required: [true, "Location is required"],
        },
        isOpen: {
            type: Boolean,
            default: true,
        },
        description: {
            type: String,
            default: "",
        },
        minOrder: {
            type: Number,
            default: 0,
        },
        deliveryFee: {
            type: Number,
            default: 0,
        },
        menu: [
            {
                id: mongoose.Schema.Types.ObjectId,
                title: String,
                desc: String,
                price: Number,
                image01: String,
                category: String,
            },
        ],
        reviews: [
            {
                userId: mongoose.Schema.Types.ObjectId,
                rating: Number,
                comment: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        totalOrders: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
