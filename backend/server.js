require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const orderRoutes = require("./src/routes/orderRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const favoritesRoutes = require("./src/routes/favoritesRoutes");
const reviewRoutes = require("./src/routes/reviewRoutes");

// Optional routes — only load if files exist
let chatbotRoutes, restaurantRoutes;
try { chatbotRoutes = require("./src/routes/chatbotRoutes"); } catch { }
try { restaurantRoutes = require("./src/routes/restaurantRoutes"); } catch { }

const app = express();

connectDB();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many requests, please try again later." },
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/favorites", favoritesRoutes);
app.use("/api/reviews", reviewRoutes);
if (chatbotRoutes) app.use("/api/chatbot", chatbotRoutes);
if (restaurantRoutes) app.use("/api/restaurants", restaurantRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date() }));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Smart Bite API running on port ${PORT}`);
    console.log(`💳 Razorpay: ${process.env.RAZORPAY_KEY_ID ? "✅ configured" : "❌ NOT configured"}`);
});
