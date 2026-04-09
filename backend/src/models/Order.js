const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    title: String,
    image01: String,
    price: Number,
    quantity: Number,
    extraIngredients: [String],
});

const timelineSchema = new mongoose.Schema({
    step: String,
    done: { type: Boolean, default: false },
    time: { type: String, default: "" },
});

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        items: [orderItemSchema],
        total: { type: Number, required: true },
        status: {
            type: String,
            enum: ["Confirmed", "Preparing", "Out for Delivery", "Delivered", "Cancelled"],
            default: "Confirmed",
        },
        timeline: [timelineSchema],
        customer: {
            name: String,
            email: String,
            phone: String,
            address: String,
            city: String,
            payment: String,
        },
        payment: {
            razorpay_order_id: String,
            razorpay_payment_id: String,
            status: { type: String, default: "pending" },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
