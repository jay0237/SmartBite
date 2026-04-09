const User = require("../models/User");
const Order = require("../models/Order");
const Product = require("../models/Product");

// GET /api/admin/stats
const getStats = async (req, res) => {
    const [totalUsers, totalOrders, totalProducts, orders] = await Promise.all([
        User.countDocuments(),
        Order.countDocuments(),
        Product.countDocuments(),
        Order.find(),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const delivered = orders.filter((o) => o.status === "Delivered").length;
    const pending = orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length;

    res.json({
        success: true,
        stats: { totalUsers, totalOrders, totalProducts, totalRevenue, delivered, pending },
    });
};

// GET /api/admin/users
const getUsers = async (req, res) => {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted" });
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
    const user = await User.findByIdAndUpdate(
        req.params.id,
        { role: req.body.role },
        { new: true }
    ).select("-password");
    res.json({ success: true, user });
};

module.exports = { getStats, getUsers, deleteUser, updateUserRole };
