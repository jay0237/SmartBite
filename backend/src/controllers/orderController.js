const Order = require("../models/Order");
const { sendReceiptEmail } = require("../utils/sendEmail");
const autoAdvanceOrder = require("../utils/autoAdvanceOrder");

const STATUS_FLOW = ["Confirmed", "Preparing", "Out for Delivery", "Delivered"];

// ── POST /api/orders — place COD order ──────────────────────
const placeOrder = async (req, res) => {
    try {
        const { items, total, customer } = req.body;

        if (!items || !items.length || !total || !customer) {
            return res.status(400).json({ success: false, message: "Missing order data" });
        }

        const timeline = STATUS_FLOW.map((step, i) => ({
            step,
            done: i === 0,
            time: i === 0 ? new Date().toLocaleTimeString() : "",
        }));

        const order = await Order.create({
            user: req.user?._id,
            items,
            total,
            customer,
            status: "Confirmed",
            timeline,
            payment: { status: "cod" },
        });

        // Send receipt email (best-effort)
        try {
            await sendReceiptEmail(customer.email, customer.name, order);
        } catch (e) {
            console.error("Receipt email failed:", e.message);
        }

        // Auto-advance order timeline → Delivered in ~5 minutes
        autoAdvanceOrder(order._id);

        res.status(201).json({ success: true, order });
    } catch (err) {
        console.error("Place order error:", err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/orders/my ───────────────────────────────────────
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/orders/track/:id — public ──────────────────────
const trackOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/orders/:id ──────────────────────────────────────
const getOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        const isOwner = order.user?.toString() === req.user?._id?.toString();
        const isAdmin = req.user?.role === "admin";
        if (!isOwner && !isAdmin) {
            return res.status(403).json({ success: false, message: "Not authorized" });
        }

        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── GET /api/admin/orders ────────────────────────────────────
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).populate("user", "name email");
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ── PUT /api/admin/orders/:id/status ────────────────────────
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        order.status = status;
        const stepIndex = STATUS_FLOW.indexOf(status);
        if (stepIndex !== -1) {
            order.timeline = STATUS_FLOW.map((step, i) => ({
                step,
                done: i <= stepIndex,
                time: i <= stepIndex
                    ? (order.timeline[i]?.time || new Date().toLocaleTimeString())
                    : "",
            }));
        }

        await order.save();
        res.json({ success: true, order });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { placeOrder, getMyOrders, getOrder, trackOrder, getAllOrders, updateOrderStatus };
