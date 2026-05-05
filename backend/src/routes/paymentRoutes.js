const router = require("express").Router();
const { createPaymentOrder, verifyPayment } = require("../controllers/paymentController");
const { protect } = require("../middleware/auth");

// Create Razorpay order (requires login)
router.post("/create-order", protect, createPaymentOrder);

// Verify payment — auth optional (user may not be logged in edge cases)
router.post("/verify", protect, verifyPayment);

module.exports = router;
