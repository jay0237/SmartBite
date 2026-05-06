const router = require("express").Router();
const { getReviews, addReview, deleteReview, canReview } = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

router.get("/can-review/:productId", protect, canReview);   // check eligibility
router.get("/:productId", getReviews);            // public
router.post("/:productId", protect, addReview);    // verified purchase only
router.delete("/:reviewId", protect, deleteReview); // owner or admin

module.exports = router;
