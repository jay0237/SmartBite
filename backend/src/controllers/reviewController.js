const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

// ── GET /api/reviews/:productId ──────────────────────────────
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.productId })
            .sort({ createdAt: -1 });
        res.json({ success: true, reviews });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST /api/reviews/:productId ─────────────────────────────
const addReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.productId;

        if (!rating || !comment) {
            return res.status(400).json({ success: false, message: "Rating and comment are required" });
        }

        // Verify product exists
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // ── Verify user has a delivered order containing this product ──
        const purchasedOrder = await Order.findOne({
            user: req.user._id,
            status: "Delivered",
            "items.product": productId,
        });

        if (!purchasedOrder) {
            return res.status(403).json({
                success: false,
                message: "You can only review products you have ordered and received.",
            });
        }

        // Check if user already reviewed this product
        const existing = await Review.findOne({ product: productId, user: req.user._id });
        if (existing) {
            return res.status(400).json({ success: false, message: "You have already reviewed this product" });
        }

        // Create review
        const review = await Review.create({
            product: productId,
            user: req.user._id,
            name: req.user.name,
            rating: Number(rating),
            comment,
            orderId: purchasedOrder._id,
            verified: true, // verified purchase badge
        });

        // Recalculate product average rating
        const allReviews = await Review.find({ product: productId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await Product.findByIdAndUpdate(productId, {
            ratings: Math.round(avgRating * 10) / 10,
            numReviews: allReviews.length,
        });

        res.status(201).json({ success: true, review });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: "You have already reviewed this product" });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── DELETE /api/reviews/:reviewId ────────────────────────────
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.reviewId);
        if (!review) return res.status(404).json({ success: false, message: "Review not found" });

        if (review.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        const productId = review.product;
        await review.deleteOne();

        // Recalculate rating
        const remaining = await Review.find({ product: productId });
        const avgRating = remaining.length
            ? remaining.reduce((sum, r) => sum + r.rating, 0) / remaining.length
            : 0;

        await Product.findByIdAndUpdate(productId, {
            ratings: Math.round(avgRating * 10) / 10,
            numReviews: remaining.length,
        });

        res.json({ success: true, message: "Review deleted" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/reviews/can-review/:productId ───────────────────
// Check if current user can review a product (has delivered order)
const canReview = async (req, res) => {
    try {
        const productId = req.params.productId;

        const purchasedOrder = await Order.findOne({
            user: req.user._id,
            status: "Delivered",
            "items.product": productId,
        });

        const alreadyReviewed = await Review.findOne({
            product: productId,
            user: req.user._id,
        });

        res.json({
            success: true,
            canReview: !!purchasedOrder && !alreadyReviewed,
            alreadyReviewed: !!alreadyReviewed,
            hasPurchased: !!purchasedOrder,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getReviews, addReview, deleteReview, canReview };
