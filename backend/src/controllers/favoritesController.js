const User = require("../models/User");
const Product = require("../models/Product");

// ── GET /api/favorites ───────────────────────────────────────
// Returns the user's favorite dishes populated with full product data
const getFavorites = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate("favorites.dishes", "title price image01 category desc");

        res.json({
            success: true,
            favorites: {
                dishes: user.favorites?.dishes || [],
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── POST /api/favorites/toggle-dish ─────────────────────────
// Adds dish if not in favorites, removes if already there (toggle)
const toggleDish = async (req, res) => {
    try {
        const { dishId } = req.body;
        if (!dishId) {
            return res.status(400).json({ success: false, message: "dishId required" });
        }

        // Verify product exists
        const product = await Product.findById(dishId);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const user = await User.findById(req.user._id);

        // Ensure favorites.dishes array exists
        if (!user.favorites) user.favorites = { dishes: [] };
        if (!user.favorites.dishes) user.favorites.dishes = [];

        const alreadySaved = user.favorites.dishes
            .some((id) => id.toString() === dishId);

        if (alreadySaved) {
            // Remove — $pull is atomic and prevents duplicates
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { "favorites.dishes": dishId },
            });
            return res.json({ success: true, action: "removed", dishId });
        } else {
            // Add — $addToSet prevents duplicates automatically
            await User.findByIdAndUpdate(req.user._id, {
                $addToSet: { "favorites.dishes": dishId },
            });
            return res.json({ success: true, action: "added", dishId });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getFavorites, toggleDish };
