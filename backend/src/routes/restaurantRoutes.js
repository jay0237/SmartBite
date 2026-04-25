const express = require("express");
const router = express.Router();
const {
    getAllRestaurants,
    getRestaurantById,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    getRestaurantMenu,
    searchRestaurants,
} = require("../controllers/restaurantController");

// Public routes
router.get("/", getAllRestaurants);
router.get("/search", searchRestaurants);
router.get("/:id", getRestaurantById);
router.get("/:id/menu", getRestaurantMenu);

// Admin routes (in production, add auth middleware)
router.post("/", createRestaurant);
router.put("/:id", updateRestaurant);
router.delete("/:id", deleteRestaurant);

module.exports = router;
