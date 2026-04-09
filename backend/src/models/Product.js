const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        desc: { type: String, default: "" },
        image01: { type: String, required: true },
        image02: { type: String, default: "" },
        image03: { type: String, default: "" },
        isAvailable: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
        ratings: { type: Number, default: 0 },
        numReviews: { type: Number, default: 0 },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
