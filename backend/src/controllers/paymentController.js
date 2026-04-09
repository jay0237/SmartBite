const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/Order");
const { sendReceiptEmail } = require("../utils/sendEmail");
const autoAdvanceOrder = require("../utils/autoAdvanceOrder");

const STATUS_FLOW = ["Confirmed", "Preparing", "Out for Delivery", "Delivered"];

// Lazy init — won't crash if keys missing at startup
const getRazorpay = () => {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
        throw new Error("Razorpay keys not configured in backend/.env");
    }
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

// ── POST /api/payment/create-order ───────────────────────────
const createPaymentOrder = async (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
        return res.status(400).json({ success: false, message: "Invalid amount" });
    }
    try {
        const razorpay = getRazorpay();
        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
        });
        res.json({ success: true, order });
    } catch (err) {
        console.error("Razorpay error:", err.message);
        res.status(500).json({ success: false, message: err.message || "Payment initiation failed" });
    }
};

// ── POST /api/payment/verify ─────────────────────────────────
const verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = req.body;

    // 1. Verify Razorpay signature
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

    if (expected !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment verification failed" });
    }

    // 2. Save order to MongoDB
    const timeline = STATUS_FLOW.map((step, i) => ({
        step,
        done: i === 0,
        time: i === 0 ? new Date().toLocaleTimeString() : "",
    }));

    const order = await Order.create({
        user: req.user?._id,
        items: orderData.items,
        total: orderData.total,
        customer: orderData.customer,
        status: "Confirmed",
        timeline,
        payment: {
            razorpay_order_id,
            razorpay_payment_id,
            status: "paid",
        },
    });

    // 3. Send receipt email (best-effort — don't fail if email fails)
    try {
        await sendReceiptEmail(orderData.customer.email, orderData.customer.name, order);
    } catch (emailErr) {
        console.error("Receipt email failed:", emailErr.message);
    }

    // Auto-advance order timeline → Delivered in ~5 minutes
    autoAdvanceOrder(order._id);

    res.json({ success: true, order });
};

module.exports = { createPaymentOrder, verifyPayment };
