const Restaurant = require("../models/Restaurant");

// GET all restaurants
exports.getAllRestaurants = async (req, res) => {
    try {
        const { cuisine, rating, sortBy } = req.query;
        let filter = {};

        // Filter by cuisine
        if (cuisine) {
            filter.cuisine = { $in: cuisine.split(",") };
        }

        // Filter by rating
        if (rating) {
            filter.rating = { $gte: parseFloat(rating) };
        }

        let query = Restaurant.find(filter);

        // Sort options
        if (sortBy === "rating") {
            query = query.sort({ rating: -1 });
        } else if (sortBy === "delivery") {
            query = query.sort({ deliveryTime: 1 });
        } else {
            query = query.sort({ createdAt: -1 });
        }

        const restaurants = await query.select("-menu -reviews");

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET single restaurant with menu
exports.getRestaurantById = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findById(id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        res.status(200).json({
            success: true,
            data: restaurant,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// CREATE restaurant (admin only)
exports.createRestaurant = async (req, res) => {
    try {
        const { name, image, cuisine, rating, deliveryTime, location, isOpen, description, minOrder, deliveryFee, menu } = req.body;

        // Validation
        if (!name || !image || !cuisine || !deliveryTime || !location) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields",
            });
        }

        const newRestaurant = new Restaurant({
            name,
            image,
            cuisine,
            rating: rating || 4.5,
            deliveryTime,
            location,
            isOpen: isOpen !== undefined ? isOpen : true,
            description,
            minOrder,
            deliveryFee,
            menu: menu || [],
        });

        const savedRestaurant = await newRestaurant.save();

        res.status(201).json({
            success: true,
            message: "Restaurant created successfully",
            data: savedRestaurant,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// UPDATE restaurant
exports.updateRestaurant = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const restaurant = await Restaurant.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Restaurant updated successfully",
            data: restaurant,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// DELETE restaurant
exports.deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findByIdAndDelete(id);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Restaurant deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET restaurant menu
exports.getRestaurantMenu = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await Restaurant.findById(id).select("menu name");

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found",
            });
        }

        res.status(200).json({
            success: true,
            data: {
                restaurantName: restaurant.name,
                menu: restaurant.menu,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// SEARCH restaurants
exports.searchRestaurants = async (req, res) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({
                success: false,
                message: "Search query is required",
            });
        }

        const restaurants = await Restaurant.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { cuisine: { $in: [new RegExp(query, "i")] } },
                { location: { $regex: query, $options: "i" } },
            ],
        }).select("-menu -reviews");

        res.status(200).json({
            success: true,
            count: restaurants.length,
            data: restaurants,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
