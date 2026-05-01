import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toggleFavoriteDish, selectIsDishFavorited } from "../../../store/shopping-cart/favoritesSlice";
import "./FavoriteBtn.css";

const FavoriteBtn = ({ item, size = "md" }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector((s) => s.auth.currentUser);
    const dishId = item?._id || item?.id;
    const isFavorited = useSelector(selectIsDishFavorited(dishId));
    const [animating, setAnimating] = useState(false);

    if (!item || !dishId) return null;

    const handleToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!currentUser) {
            navigate("/login");
            return;
        }

        setAnimating(true);
        setTimeout(() => setAnimating(false), 500);

        dispatch(toggleFavoriteDish(item));
    };

    return (
        <button
            className={`fav__btn fav__btn--${size} ${isFavorited ? "fav__btn--active" : ""}`}
            onClick={handleToggle}
            title={isFavorited ? "Remove from favourites" : "Save to favourites"}
            aria-label={isFavorited ? "Remove from favourites" : "Save to favourites"}
        >
            <motion.i
                className={isFavorited ? "ri-heart-fill" : "ri-heart-line"}
                animate={animating ? { scale: [1, 1.6, 0.85, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            />
        </button>
    );
};

export default FavoriteBtn;
