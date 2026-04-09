const User = require("../models/User");
const OTP = require("../models/OTP");
const generateToken = require("../utils/generateToken");
const generateOTP = require("../utils/generateOTP");
const { sendOTPEmail } = require("../utils/sendEmail");
const bcrypt = require("bcryptjs");

// ── POST /api/auth/send-otp ──────────────────────────────────
const sendOtp = async (req, res) => {
    const { email, name } = req.body;
    if (!email || !name) {
        return res.status(400).json({ success: false, message: "Email and name required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Delete any previous OTPs for this email
    await OTP.deleteMany({ email });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await OTP.create({ email, otp, expiresAt });

    try {
        await sendOTPEmail(email, name, otp);
        res.json({ success: true, message: "OTP sent to " + email });
    } catch (err) {
        console.error("Email send error:", err);
        // Dev fallback — return OTP in response only in development
        if (process.env.NODE_ENV === "development") {
            return res.json({ success: true, message: "OTP sent (dev)", devOtp: otp });
        }
        res.status(500).json({ success: false, message: "Failed to send email" });
    }
};

// ── POST /api/auth/verify-otp ────────────────────────────────
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ success: false, message: "Email and OTP required" });
    }

    const record = await OTP.findOne({ email, used: false }).sort({ createdAt: -1 });

    if (!record) {
        return res.status(400).json({ success: false, message: "OTP not found or already used" });
    }
    if (new Date() > record.expiresAt) {
        return res.status(400).json({ success: false, message: "OTP has expired" });
    }
    if (record.otp !== otp) {
        return res.status(400).json({ success: false, message: "Incorrect OTP" });
    }

    // Mark as used
    record.used = true;
    await record.save();

    res.json({ success: true, message: "OTP verified" });
};

// ── POST /api/auth/register ──────────────────────────────────
const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
        return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({ name, email, password, isVerified: true });
    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
};

// ── POST /api/auth/login ─────────────────────────────────────
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.json({
        success: true,
        token,
        user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    });
};

// ── GET /api/auth/me ─────────────────────────────────────────
const getMe = async (req, res) => {
    res.json({ success: true, user: req.user });
};

module.exports = { sendOtp, verifyOtp, register, login, getMe };
