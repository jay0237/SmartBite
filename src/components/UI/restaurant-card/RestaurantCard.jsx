import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./restaurant-card.css";

const RestaurantCard = ({ restaurant }) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.3 },
        },
        hover: {
            y: -8,
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
            transition: { duration: 0.3 },
        },
    };

    const imageVariants = {
        hover: {
            scale: 1.1,
            transition: { duration: 0.3 },
        },
    };

    return (
        <motion.div
            className="restaurant__card"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
        >
            <Link to={`/restaurants/${restaurant._id}`} className="restaurant__card-link">
                <div className="restaurant__img-wrapper">
                    <motion.img
                        src={restaurant.image}
                        alt={restaurant.name}
                        className="restaurant__img"
                        variants={imageVariants}
                    />
                    {!restaurant.isOpen && (
                        <div className="restaurant__closed-badge">Closed</div>
                    )}
                    <div className="restaurant__delivery-badge">
                        {restaurant.deliveryTime}
                    </div>
                </div>

                <div className="restaurant__info">
                    <h3 className="restaurant__name">{restaurant.name}</h3>

                    <div className="restaurant__rating">
                        <span className="restaurant__stars">
                            ⭐ {restaurant.rating != null ? Number(restaurant.rating).toFixed(1) : "N/A"}
                        </span>
                        <span className="restaurant__orders">
                            ({restaurant.totalOrders || 0} orders)
                        </span>
                    </div>

                    <p className="restaurant__cuisine">
                        {Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(", ") : restaurant.cuisine || ""}
                    </p>

                    <div className="restaurant__footer">
                        <span className="restaurant__location">
                            📍 {restaurant.location}
                        </span>
                        {restaurant.deliveryFee > 0 && (
                            <span className="restaurant__fee">
                                ₹{restaurant.deliveryFee} delivery
                            </span>
                        )}
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default RestaurantCard;
