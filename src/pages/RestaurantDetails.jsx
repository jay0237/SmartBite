import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import Helmet from "../components/Helmet/Helmet";
import SkeletonLoader from "../components/UI/skeleton/SkeletonLoader";
import { getRestaurantById } from "../api/restaurants";
import { restaurantActions } from "../store/shopping-cart/restaurantSlice";
import { cartActions } from "../store/shopping-cart/cartSlice";
import "../styles/restaurant-details.css";

const RestaurantDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { selectedRestaurant, loading } = useSelector(
        (state) => state.restaurants
    );
    const [selectedCategory, setSelectedCategory] = useState("All");

    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                dispatch(restaurantActions.setLoading(true));
                const data = await getRestaurantById(id);
                dispatch(restaurantActions.setSelectedRestaurant(data.data));
            } catch (error) {
                dispatch(
                    restaurantActions.setError(
                        error.message || "Failed to fetch restaurant"
                    )
                );
            }
        };

        fetchRestaurant();
    }, [id, dispatch]);

    const handleAddToCart = (item) => {
        dispatch(
            cartActions.addItem({
                id: item.id || item._id,
                title: item.title,
                image01: item.image01,
                price: item.price,
            })
        );
    };

    if (loading) {
        return (
            <Helmet title="Restaurant Details - Smart Bite">
                <SkeletonLoader type="details" />
            </Helmet>
        );
    }

    if (!selectedRestaurant) {
        return (
            <Helmet title="Restaurant Not Found - Smart Bite">
                <section className="restaurant__details-section">
                    <div className="container">
                        <div className="restaurant__not-found">
                            <h2>Restaurant not found</h2>
                            <button
                                className="restaurant__back-btn"
                                onClick={() => navigate("/restaurants")}
                            >
                                Back to Restaurants
                            </button>
                        </div>
                    </div>
                </section>
            </Helmet>
        );
    }

    const categories = [
        "All",
        ...new Set(selectedRestaurant.menu?.map((item) => item.category) || []),
    ];

    const filteredMenu =
        selectedCategory === "All"
            ? selectedRestaurant.menu
            : selectedRestaurant.menu?.filter(
                (item) => item.category === selectedCategory
            );

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
    };

    return (
        <Helmet title={`${selectedRestaurant.name} - Smart Bite`}>
            <section className="restaurant__details-section">
                {/* Hero Section */}
                <div className="restaurant__hero">
                    <img
                        src={selectedRestaurant.image}
                        alt={selectedRestaurant.name}
                        className="restaurant__hero-img"
                    />
                    <button
                        className="restaurant__back-btn"
                        onClick={() => navigate("/restaurants")}
                    >
                        <i className="ri-arrow-left-line"></i>
                    </button>
                </div>

                <div className="container">
                    {/* Restaurant Info */}
                    <div className="restaurant__header">
                        <div className="restaurant__header-content">
                            <h1 className="restaurant__title">
                                {selectedRestaurant.name}
                            </h1>

                            <div className="restaurant__meta">
                                <span className="restaurant__rating">
                                    ⭐ {selectedRestaurant.rating.toFixed(1)}
                                </span>
                                <span className="restaurant__separator">•</span>
                                <span className="restaurant__delivery">
                                    🚚 {selectedRestaurant.deliveryTime}
                                </span>
                                <span className="restaurant__separator">•</span>
                                <span className="restaurant__location">
                                    📍 {selectedRestaurant.location}
                                </span>
                            </div>

                            <p className="restaurant__description">
                                {selectedRestaurant.description}
                            </p>

                            <div className="restaurant__tags">
                                {selectedRestaurant.cuisine.map((c) => (
                                    <span key={c} className="restaurant__tag">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="restaurant__info-box">
                            <div className="restaurant__info-item">
                                <span className="restaurant__info-label">
                                    Delivery Fee
                                </span>
                                <span className="restaurant__info-value">
                                    ₹{selectedRestaurant.deliveryFee}
                                </span>
                            </div>
                            <div className="restaurant__info-item">
                                <span className="restaurant__info-label">
                                    Min Order
                                </span>
                                <span className="restaurant__info-value">
                                    ₹{selectedRestaurant.minOrder}
                                </span>
                            </div>
                            <div className="restaurant__info-item">
                                <span className="restaurant__info-label">
                                    Status
                                </span>
                                <span
                                    className={`restaurant__status ${selectedRestaurant.isOpen
                                            ? "open"
                                            : "closed"
                                        }`}
                                >
                                    {selectedRestaurant.isOpen
                                        ? "Open"
                                        : "Closed"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Menu Section */}
                    <div className="restaurant__menu-section">
                        <h2 className="restaurant__menu-title">Menu</h2>

                        {/* Category Filter */}
                        <div className="restaurant__categories">
                            {categories.map((category) => (
                                <button
                                    key={category}
                                    className={`restaurant__category-btn ${selectedCategory === category
                                            ? "active"
                                            : ""
                                        }`}
                                    onClick={() => setSelectedCategory(category)}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Menu Items */}
                        {filteredMenu && filteredMenu.length > 0 ? (
                            <motion.div
                                className="restaurant__menu-grid"
                                variants={containerVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                {filteredMenu.map((item) => (
                                    <motion.div
                                        key={item.id || item._id}
                                        className="restaurant__menu-item"
                                        variants={itemVariants}
                                        whileHover={{ y: -4 }}
                                    >
                                        <div className="restaurant__item-img-wrapper">
                                            <img
                                                src={item.image01}
                                                alt={item.title}
                                                className="restaurant__item-img"
                                            />
                                        </div>

                                        <div className="restaurant__item-content">
                                            <h4 className="restaurant__item-title">
                                                {item.title}
                                            </h4>
                                            <p className="restaurant__item-desc">
                                                {item.desc}
                                            </p>

                                            <div className="restaurant__item-footer">
                                                <span className="restaurant__item-price">
                                                    ₹{item.price}
                                                </span>
                                                <button
                                                    className="restaurant__add-btn"
                                                    onClick={() =>
                                                        handleAddToCart(item)
                                                    }
                                                    disabled={
                                                        !selectedRestaurant.isOpen
                                                    }
                                                >
                                                    <i className="ri-add-line"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="restaurant__no-items">
                                <p>No items available in this category</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </Helmet>
    );
};

export default RestaurantDetails;
