import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/common-section/CommonSection";
import RestaurantCard from "../components/UI/restaurant-card/RestaurantCard";
import SkeletonLoader from "../components/UI/skeleton/SkeletonLoader";
import { getRestaurants } from "../api/restaurants";
import { restaurantActions } from "../store/shopping-cart/restaurantSlice";
import "../styles/restaurants.css";

const Restaurants = () => {
    const dispatch = useDispatch();
    const { restaurants, loading, error, filters } = useSelector(
        (state) => state.restaurants
    );
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredRestaurants, setFilteredRestaurants] = useState([]);

    // Fetch restaurants on mount
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                dispatch(restaurantActions.setLoading(true));
                const params = {};

                if (filters.cuisine.length > 0) {
                    params.cuisine = filters.cuisine.join(",");
                }
                if (filters.rating > 0) {
                    params.rating = filters.rating;
                }
                if (filters.sortBy !== "default") {
                    params.sortBy = filters.sortBy;
                }

                const data = await getRestaurants(params);
                dispatch(restaurantActions.setRestaurants(data?.data || []));
            } catch (err) {
                dispatch(
                    restaurantActions.setError(
                        err.message || "Failed to fetch restaurants"
                    )
                );
            }
        };

        fetchRestaurants();
    }, [dispatch, filters]);

    // Filter restaurants based on search term
    useEffect(() => {
        if (!Array.isArray(restaurants)) {
            setFilteredRestaurants([]);
            return;
        }
        if (searchTerm.trim() === "") {
            setFilteredRestaurants(restaurants);
        } else {
            const lower = searchTerm.toLowerCase();
            const filtered = restaurants.filter(
                (r) =>
                    r.name?.toLowerCase().includes(lower) ||
                    r.cuisine?.some((c) => c.toLowerCase().includes(lower)) ||
                    r.location?.toLowerCase().includes(lower)
            );
            setFilteredRestaurants(filtered);
        }
    }, [searchTerm, restaurants]);

    const handleCuisineFilter = (cuisine) => {
        const currentCuisines = filters.cuisine;
        const updatedCuisines = currentCuisines.includes(cuisine)
            ? currentCuisines.filter((c) => c !== cuisine)
            : [...currentCuisines, cuisine];
        dispatch(restaurantActions.setFilters({ cuisine: updatedCuisines }));
    };

    const handleRatingFilter = (rating) => {
        dispatch(
            restaurantActions.setFilters({
                rating: filters.rating === rating ? 0 : rating,
            })
        );
    };

    const handleSortChange = (sortBy) => {
        dispatch(restaurantActions.setFilters({ sortBy }));
    };

    const handleClearFilters = () => {
        dispatch(restaurantActions.clearFilters());
        setSearchTerm("");
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    const cuisineOptions = [
        "Italian", "Chinese", "Indian", "Mexican",
        "Japanese", "American", "Thai", "Continental",
    ];

    const hasActiveFilters =
        filters.cuisine.length > 0 ||
        filters.rating > 0 ||
        filters.sortBy !== "default" ||
        searchTerm;

    return (
        <Helmet title="Restaurants - Smart Bite">
            <CommonSection title="Restaurants" />

            <section className="restaurants__section">
                <div className="container">
                    {/* Filters */}
                    <div className="restaurants__filters">
                        {/* Search */}
                        <div className="restaurants__search">
                            <input
                                type="text"
                                placeholder="Search restaurants, cuisines..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="restaurants__search-input"
                            />
                            <i className="ri-search-line"></i>
                        </div>

                        {/* Cuisine Filter */}
                        <div className="restaurants__filter-group">
                            <h5 className="restaurants__filter-title">Cuisine</h5>
                            <div className="restaurants__filter-options">
                                {cuisineOptions.map((cuisine) => (
                                    <label key={cuisine} className="restaurants__filter-label">
                                        <input
                                            type="checkbox"
                                            checked={filters.cuisine.includes(cuisine)}
                                            onChange={() => handleCuisineFilter(cuisine)}
                                        />
                                        <span>{cuisine}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Rating Filter */}
                        <div className="restaurants__filter-group">
                            <h5 className="restaurants__filter-title">Rating</h5>
                            <div className="restaurants__filter-options">
                                {[4.5, 4, 3.5, 3].map((rating) => (
                                    <label key={rating} className="restaurants__filter-label">
                                        <input
                                            type="radio"
                                            name="rating"
                                            checked={filters.rating === rating}
                                            onChange={() => handleRatingFilter(rating)}
                                        />
                                        <span>⭐ {rating}+</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Sort */}
                        <div className="restaurants__filter-group">
                            <h5 className="restaurants__filter-title">Sort By</h5>
                            <select
                                value={filters.sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="restaurants__sort-select"
                            >
                                <option value="default">Default</option>
                                <option value="rating">Rating (High to Low)</option>
                                <option value="delivery">Delivery Time</option>
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {hasActiveFilters && (
                            <button
                                className="restaurants__clear-btn"
                                onClick={handleClearFilters}
                            >
                                Clear Filters
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="restaurants__content">
                        {loading ? (
                            <SkeletonLoader count={6} type="card" />
                        ) : error ? (
                            <div className="restaurants__error">
                                <div className="restaurants__error-icon">⚠️</div>
                                <h3>Could not load restaurants</h3>
                                <p>{error}</p>
                                <p className="restaurants__error-hint">
                                    Make sure the backend server is running on port 5001 and restaurants are seeded.
                                </p>
                                <button
                                    className="restaurants__clear-btn"
                                    onClick={() => {
                                        dispatch(restaurantActions.clearError());
                                        dispatch(restaurantActions.setLoading(true));
                                        getRestaurants({})
                                            .then((d) => dispatch(restaurantActions.setRestaurants(d?.data || [])))
                                            .catch((e) => dispatch(restaurantActions.setError(e.message)));
                                    }}
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredRestaurants.length > 0 ? (
                            <motion.div
                                className="restaurants__grid"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {filteredRestaurants.map((restaurant) => (
                                    <RestaurantCard
                                        key={restaurant._id}
                                        restaurant={restaurant}
                                    />
                                ))}
                            </motion.div>
                        ) : (
                            <div className="restaurants__empty">
                                <div className="restaurants__empty-icon">🍽️</div>
                                <h3>No restaurants found</h3>
                                <p>
                                    {hasActiveFilters
                                        ? "Try adjusting your filters or search term"
                                        : "No restaurants available yet. Seed the database to get started."}
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        className="restaurants__clear-btn"
                                        onClick={handleClearFilters}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </Helmet>
    );
};

export default Restaurants;
