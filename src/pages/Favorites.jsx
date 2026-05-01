import React, { useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    fetchFavorites,
    toggleFavoriteDish,
    selectFavoriteDishes,
} from "../store/shopping-cart/favoritesSlice";
import { cartActions } from "../store/shopping-cart/cartSlice";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/common-section/CommonSection";

const Favorites = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector((s) => s.auth.currentUser);
    const dishes = useSelector(selectFavoriteDishes);
    const loading = useSelector((s) => s.favorites.loading);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!currentUser) { navigate("/login"); return; }
        dispatch(fetchFavorites());
    }, [currentUser, dispatch, navigate]);

    const handleRemove = (dish) => dispatch(toggleFavoriteDish(dish));

    const handleAddToCart = (dish) => {
        dispatch(cartActions.addItem({
            id: dish._id || dish.id,
            title: dish.title,
            image01: dish.image01,
            price: dish.price,
            extraIngredients: [],
        }));
    };

    return (
        <Helmet title="My Favourites">
            <CommonSection title="My Favourites" />
            <section style={{ padding: "40px 0 80px" }}>
                <Container>

                    {/* Header row */}
                    <div className="d-flex align-items-center justify-content-between mb-4">
                        <div>
                            <h4 style={{ margin: 0 }}>
                                Saved Dishes
                                {dishes.length > 0 && (
                                    <span style={{
                                        marginLeft: 10, fontSize: "0.85rem", fontWeight: 500,
                                        color: "var(--text-muted)",
                                    }}>
                                        ({dishes.length} item{dishes.length !== 1 ? "s" : ""})
                                    </span>
                                )}
                            </h4>
                        </div>
                        {dishes.length > 0 && (
                            <button
                                onClick={() => navigate("/pizzas")}
                                style={{
                                    background: "transparent", border: "1px solid var(--border)",
                                    color: "var(--text-muted)", padding: "8px 18px",
                                    borderRadius: "50px", cursor: "pointer", fontSize: "0.85rem",
                                    transition: "all 0.2s",
                                }}
                            >
                                <i className="ri-restaurant-line me-2"></i>Browse More
                            </button>
                        )}
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="text-center py-5">
                            <i className="ri-loader-4-line" style={{
                                fontSize: "2.5rem", color: "var(--primary)",
                                animation: "reg-spin 1s linear infinite", display: "inline-block",
                            }}></i>
                            <p style={{ color: "var(--text-muted)", marginTop: 12 }}>Loading favourites...</p>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && dishes.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ textAlign: "center", padding: "80px 20px" }}
                        >
                            <div style={{
                                width: 80, height: 80, borderRadius: "50%",
                                background: "rgba(244,67,54,0.08)",
                                border: "2px solid rgba(244,67,54,0.2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 20px", fontSize: "2rem", color: "#f44336",
                            }}>
                                <i className="ri-heart-line"></i>
                            </div>
                            <h5 style={{ color: "var(--text)", marginBottom: 8 }}>No favourites yet</h5>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 24 }}>
                                Tap the ❤️ on any dish to save it here for quick access.
                            </p>
                            <button
                                onClick={() => navigate("/pizzas")}
                                className="btn-primary-custom"
                                style={{ padding: "12px 28px" }}
                            >
                                <i className="ri-restaurant-line me-2"></i>Explore Menu
                            </button>
                        </motion.div>
                    )}

                    {/* Favorites grid */}
                    {!loading && dishes.length > 0 && (
                        <Row>
                            <AnimatePresence>
                                {dishes.map((dish, i) => (
                                    <Col lg="3" md="4" sm="6" xs="6" key={dish._id || dish.id} className="mb-4">
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                            transition={{ delay: i * 0.05 }}
                                            style={{
                                                background: "var(--bg-card)",
                                                border: "1px solid var(--border)",
                                                borderRadius: "var(--radius)",
                                                overflow: "hidden",
                                                height: "100%",
                                                display: "flex",
                                                flexDirection: "column",
                                            }}
                                        >
                                            {/* Image */}
                                            <div style={{ position: "relative", height: 180, overflow: "hidden" }}>
                                                <img
                                                    src={dish.image01}
                                                    alt={dish.title}
                                                    style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                                                    onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                                                    onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
                                                />
                                                {/* Category badge */}
                                                <span style={{
                                                    position: "absolute", top: 10, left: 10,
                                                    background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                                                    color: "#fff", padding: "3px 10px", borderRadius: "50px",
                                                    fontSize: "0.7rem", fontWeight: 600,
                                                }}>
                                                    {dish.category}
                                                </span>
                                                {/* Remove heart button */}
                                                <button
                                                    onClick={() => handleRemove(dish)}
                                                    style={{
                                                        position: "absolute", top: 10, right: 10,
                                                        width: 32, height: 32, borderRadius: "50%",
                                                        background: "rgba(244,67,54,0.15)",
                                                        border: "1px solid rgba(244,67,54,0.4)",
                                                        color: "#f44336", cursor: "pointer",
                                                        display: "flex", alignItems: "center", justifyContent: "center",
                                                        fontSize: "0.9rem", transition: "all 0.2s",
                                                    }}
                                                    title="Remove from favourites"
                                                >
                                                    <i className="ri-heart-fill"></i>
                                                </button>
                                            </div>

                                            {/* Content */}
                                            <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column" }}>
                                                <h6
                                                    style={{ fontWeight: 700, marginBottom: 4, cursor: "pointer", color: "var(--text)" }}
                                                    onClick={() => navigate(`/pizzas/${dish._id || dish.id}`)}
                                                >
                                                    {dish.title}
                                                </h6>
                                                {dish.desc && (
                                                    <p style={{
                                                        fontSize: "0.78rem", color: "var(--text-muted)",
                                                        lineHeight: 1.5, marginBottom: 12,
                                                        display: "-webkit-box", WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical", overflow: "hidden",
                                                    }}>
                                                        {dish.desc}
                                                    </p>
                                                )}
                                                <div className="d-flex align-items-center justify-content-between mt-auto">
                                                    <span style={{
                                                        fontWeight: 800, fontSize: "1.1rem",
                                                        background: "linear-gradient(135deg, var(--primary), var(--accent))",
                                                        WebkitBackgroundClip: "text",
                                                        WebkitTextFillColor: "transparent",
                                                    }}>
                                                        ₹{Number(dish.price).toFixed(2)}
                                                    </span>
                                                    <button
                                                        onClick={() => handleAddToCart(dish)}
                                                        style={{
                                                            background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                                                            border: "none", color: "#fff",
                                                            padding: "7px 16px", borderRadius: "50px",
                                                            fontSize: "0.8rem", fontWeight: 600,
                                                            cursor: "pointer", transition: "all 0.3s",
                                                            boxShadow: "0 3px 10px rgba(255,107,53,0.3)",
                                                        }}
                                                    >
                                                        <i className="ri-shopping-cart-line me-1"></i>Add
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Col>
                                ))}
                            </AnimatePresence>
                        </Row>
                    )}
                </Container>
            </section>
        </Helmet>
    );
};

export default Favorites;
