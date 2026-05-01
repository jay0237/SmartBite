const router = require("express").Router();
const { getFavorites, toggleDish } = require("../controllers/favoritesController");
const { protect } = require("../middleware/auth");

// All favorites routes require authentication
router.use(protect);

router.get("/", getFavorites);
router.post("/toggle-dish", toggleDish);

module.exports = router;
