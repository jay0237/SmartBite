import React from "react";
import { motion } from "framer-motion";
import "./skeleton.css";

const SkeletonLoader = ({ count = 6, type = "card" }) => {
    const skeletonVariants = {
        animate: {
            opacity: [0.5, 1, 0.5],
            transition: {
                duration: 1.5,
                repeat: Infinity,
            },
        },
    };

    if (type === "card") {
        return (
            <div className="skeleton__grid">
                {Array.from({ length: count }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="skeleton__card"
                        variants={skeletonVariants}
                        animate="animate"
                    >
                        <div className="skeleton__image" />
                        <div className="skeleton__content">
                            <div className="skeleton__title" />
                            <div className="skeleton__text" />
                            <div className="skeleton__text short" />
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    }

    if (type === "details") {
        return (
            <motion.div
                className="skeleton__details"
                variants={skeletonVariants}
                animate="animate"
            >
                <div className="skeleton__hero" />
                <div className="skeleton__info">
                    <div className="skeleton__title large" />
                    <div className="skeleton__text" />
                    <div className="skeleton__text" />
                </div>
            </motion.div>
        );
    }

    return null;
};

export default SkeletonLoader;
