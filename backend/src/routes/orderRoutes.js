const router = require("express").Router();
const { placeOrder, getMyOrders, getOrder, trackOrder } = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

// IMPORTANT: specific routes must come before /:id
router.post("/", protect, placeOrder);
router.get("/my", protect, getMyOrders);   // must be before /:id
router.get("/track/:id", trackOrder);              // public
router.get("/:id", protect, getOrder);

module.exports = router;
