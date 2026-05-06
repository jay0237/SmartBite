import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getMyOrders, trackOrder } from "../api/orders";
import { addReview } from "../api/reviews";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/common-section/CommonSection";

const statusColors = {
    Confirmed: "#2196f3",
    Preparing: "#ff9800",
    "Out for Delivery": "#9c27b0",
    Delivered: "#4caf50",
    Cancelled: "#f44336",
};
const statusIcons = {
    Confirmed: "ri-checkbox-circle-line",
    Preparing: "ri-fire-line",
    "Out for Delivery": "ri-e-bike-line",
    Delivered: "ri-home-smile-line",
    Cancelled: "ri-close-circle-line",
};

// ── Inline star picker ────────────────────────────────────────
const StarPicker = ({ value, onChange }) => {
    const [hovered, setHovered] = useState(0);
    return (
        <div style={{ display: "flex", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((s) => (
                <i key={s}
                    className={s <= (hovered || value) ? "ri-star-fill" : "ri-star-line"}
                    style={{ fontSize: "1.3rem", color: s <= (hovered || value) ? "#ffd700" : "var(--text-muted)", cursor: "pointer", transition: "transform 0.15s" }}
                    onMouseEnter={() => setHovered(s)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => onChange(s)}
                />
            ))}
        </div>
    );
};

// ── Inline review form for a single item ─────────────────────
const ReviewForm = ({ item, onSubmit, onSkip }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) { setError("Please select a rating."); return; }
        if (!comment.trim()) { setError("Please write a comment."); return; }
        setLoading(true);
        setError("");
        try {
            await onSubmit(item.product, { rating, comment: comment.trim() });
        } catch (err) {
            setError(err.response?.data?.message || "Failed to submit.");
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{
                background: "rgba(255,107,53,0.05)",
                border: "1px solid rgba(255,107,53,0.2)",
                borderRadius: 10, padding: "14px 16px", marginTop: 10,
                overflow: "hidden",
            }}
        >
            <div style={{ fontSize: "0.8rem", color: "var(--primary)", fontWeight: 600, marginBottom: 10 }}>
                <i className="ri-shield-check-fill me-1"></i>
                Rate "{item.title}"
            </div>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 10 }}>
                    <StarPicker value={rating} onChange={(v) => { setRating(v); setError(""); }} />
                </div>
                <textarea
                    value={comment}
                    onChange={(e) => { setComment(e.target.value); setError(""); }}
                    placeholder="How was this dish? Share your experience..."
                    rows={2}
                    maxLength={500}
                    style={{
                        width: "100%", background: "rgba(255,255,255,0.05)",
                        border: "1px solid var(--border)", borderRadius: 8,
                        color: "var(--text)", padding: "8px 12px", fontSize: "0.82rem",
                        fontFamily: "Poppins, sans-serif", resize: "none", outline: "none",
                        marginBottom: 8,
                    }}
                />
                {error && (
                    <p style={{ color: "var(--danger)", fontSize: "0.78rem", marginBottom: 8 }}>
                        <i className="ri-error-warning-line me-1"></i>{error}
                    </p>
                )}
                <div className="d-flex gap-2">
                    <button type="submit" disabled={loading} style={{
                        background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                        border: "none", color: "#fff", padding: "7px 18px",
                        borderRadius: "50px", fontSize: "0.8rem", fontWeight: 600,
                        cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1,
                        fontFamily: "Poppins, sans-serif",
                    }}>
                        {loading ? "Submitting..." : <><i className="ri-send-plane-line me-1"></i>Submit</>}
                    </button>
                    <button type="button" onClick={onSkip} style={{
                        background: "transparent", border: "1px solid var(--border)",
                        color: "var(--text-muted)", padding: "7px 14px",
                        borderRadius: "50px", fontSize: "0.8rem", cursor: "pointer",
                        fontFamily: "Poppins, sans-serif",
                    }}>
                        Skip
                    </button>
                </div>
            </form>
        </motion.div>
    );
};

// ── Order card ────────────────────────────────────────────────
const OrderCard = ({ order, currentUser }) => {
    const navigate = useNavigate();
    // Track which items have been reviewed or skipped in this session
    const [reviewedItems, setReviewedItems] = useState({});
    const [activeReview, setActiveReview] = useState(null); // productId being reviewed

    const isDelivered = order.status === "Delivered";

    const handleReviewSubmit = async (productId, data) => {
        await addReview(productId, data);
        setReviewedItems((prev) => ({ ...prev, [productId]: "done" }));
        setActiveReview(null);
    };

    const handleSkip = (productId) => {
        setReviewedItems((prev) => ({ ...prev, [productId]: "skipped" }));
        setActiveReview(null);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", marginBottom: 20 }}
        >
            {/* Header */}
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
                <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Order ID</div>
                    <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.9rem" }}>{order._id}</div>
                </div>
                <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Placed</div>
                    <div style={{ fontSize: "0.85rem" }}>{new Date(order.createdAt).toLocaleString()}</div>
                </div>
                <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Total</div>
                    <div style={{ fontWeight: 700, color: "var(--primary)" }}>₹{Number(order.total).toFixed(2)}</div>
                </div>
                <span style={{
                    padding: "6px 16px", borderRadius: "50px", fontWeight: 700, fontSize: "0.85rem",
                    background: `${statusColors[order.status]}20`,
                    color: statusColors[order.status],
                    border: `1px solid ${statusColors[order.status]}40`,
                }}>
                    <i className={`${statusIcons[order.status]} me-1`}></i>{order.status}
                </span>
            </div>

            {/* Timeline */}
            <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
                {order.timeline?.map((step, i) => (
                    <div key={step.step} className="d-flex align-items-center gap-2 flex-grow-1">
                        <div style={{ textAlign: "center", flex: 1 }}>
                            <div style={{
                                width: 44, height: 44, borderRadius: "50%", margin: "0 auto 8px",
                                background: step.done ? "linear-gradient(135deg, var(--primary), var(--primary-dark))" : "rgba(255,255,255,0.05)",
                                border: `2px solid ${step.done ? "var(--primary)" : "var(--border)"}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "1.1rem", color: step.done ? "#fff" : "var(--text-muted)",
                            }}>
                                <i className={statusIcons[step.step] || "ri-checkbox-blank-circle-line"}></i>
                            </div>
                            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: step.done ? "var(--text)" : "var(--text-muted)" }}>{step.step}</div>
                            {step.time && <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{step.time}</div>}
                        </div>
                        {i < order.timeline.length - 1 && (
                            <div style={{ flex: 2, height: 2, background: step.done ? "var(--primary)" : "var(--border)", marginBottom: 28 }}></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Items + Rate buttons */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 10 }}>
                    Items Ordered
                    {isDelivered && (
                        <span style={{ marginLeft: 8, color: "#4caf50", fontSize: "0.75rem" }}>
                            <i className="ri-star-line me-1"></i>Rate your items below
                        </span>
                    )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {order.items?.map((item, i) => {
                        const pid = item.product;
                        const reviewed = reviewedItems[pid];
                        const isActive = activeReview === pid;

                        return (
                            <div key={i}>
                                <div className="d-flex align-items-center gap-3" style={{
                                    background: "rgba(255,255,255,0.03)",
                                    border: "1px solid var(--border)",
                                    borderRadius: 10, padding: "10px 14px",
                                }}>
                                    <img src={item.image01} alt={item.title}
                                        style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 8, cursor: "pointer", flexShrink: 0 }}
                                        onClick={() => navigate(`/pizzas/${pid}`)}
                                    />
                                    <div className="flex-grow-1">
                                        <div style={{ fontSize: "0.85rem", fontWeight: 600, cursor: "pointer" }}
                                            onClick={() => navigate(`/pizzas/${pid}`)}>
                                            {item.title}
                                        </div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>x{item.quantity}</div>
                                    </div>

                                    {/* Rate button — only for delivered orders */}
                                    {isDelivered && currentUser && pid && (
                                        reviewed === "done" ? (
                                            <span style={{ fontSize: "0.75rem", color: "#4caf50", fontWeight: 600, whiteSpace: "nowrap" }}>
                                                <i className="ri-checkbox-circle-fill me-1"></i>Reviewed
                                            </span>
                                        ) : reviewed === "skipped" ? (
                                            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Skipped</span>
                                        ) : (
                                            <button
                                                onClick={() => setActiveReview(isActive ? null : pid)}
                                                style={{
                                                    background: isActive ? "rgba(255,107,53,0.15)" : "transparent",
                                                    border: `1px solid ${isActive ? "var(--primary)" : "var(--border)"}`,
                                                    color: isActive ? "var(--primary)" : "var(--text-muted)",
                                                    padding: "5px 12px", borderRadius: "50px",
                                                    fontSize: "0.75rem", fontWeight: 600,
                                                    cursor: "pointer", whiteSpace: "nowrap",
                                                    fontFamily: "Poppins, sans-serif",
                                                    transition: "all 0.2s",
                                                }}
                                            >
                                                <i className="ri-star-line me-1"></i>
                                                {isActive ? "Cancel" : "Rate"}
                                            </button>
                                        )
                                    )}
                                </div>

                                {/* Inline review form */}
                                <AnimatePresence>
                                    {isActive && (
                                        <ReviewForm
                                            item={item}
                                            onSubmit={handleReviewSubmit}
                                            onSkip={() => handleSkip(pid)}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

// ── Page ──────────────────────────────────────────────────────
const OrderStatus = () => {
    const currentUser = useSelector((s) => s.auth.currentUser);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchId, setSearchId] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [searchErr, setSearchErr] = useState("");

    useEffect(() => {
        if (!currentUser) return;
        const fetch = () => {
            getMyOrders()
                .then(({ data }) => setOrders(data.orders))
                .catch(console.error)
                .finally(() => setLoading(false));
        };
        setLoading(true);
        fetch();
        const interval = setInterval(fetch, 30000);
        return () => clearInterval(interval);
    }, [currentUser]);

    const handleSearch = async (e) => {
        e.preventDefault();
        setSearchErr("");
        setSearchResult(null);
        try {
            const { data } = await trackOrder(searchId.trim());
            setSearchResult(data.order);
        } catch {
            setSearchErr("Order not found. Please check the Order ID.");
        }
    };

    const displayOrders = searchResult ? [searchResult] : orders;

    return (
        <Helmet title="Order Status">
            <CommonSection title="Order Status" />
            <section style={{ padding: "40px 0 80px" }}>
                <Container>
                    {/* Search */}
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "28px", marginBottom: 32 }}>
                        <h5 style={{ marginBottom: 16 }}>Track Your Order</h5>
                        <form onSubmit={handleSearch} className="d-flex gap-3 flex-wrap">
                            <input type="text" placeholder="Enter your Order ID..."
                                value={searchId} onChange={(e) => setSearchId(e.target.value)}
                                className="input-custom flex-grow-1" />
                            <button type="submit" className="btn-primary-custom" style={{ whiteSpace: "nowrap" }}>
                                <i className="ri-search-line me-2"></i>Track
                            </button>
                            {searchResult && (
                                <button type="button" onClick={() => { setSearchResult(null); setSearchId(""); }}
                                    style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "12px 20px", borderRadius: "50px", cursor: "pointer" }}>
                                    Clear
                                </button>
                            )}
                        </form>
                        {searchErr && <p style={{ color: "var(--danger)", fontSize: "0.85rem", marginTop: 10, marginBottom: 0 }}>{searchErr}</p>}
                    </motion.div>

                    {loading ? (
                        <div className="text-center py-5">
                            <i className="ri-loader-4-line" style={{ fontSize: "2.5rem", color: "var(--primary)", animation: "reg-spin 1s linear infinite", display: "inline-block" }}></i>
                        </div>
                    ) : displayOrders.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 20px" }}>
                            <i className="ri-file-list-3-line" style={{ fontSize: "4rem", color: "var(--text-muted)", display: "block", marginBottom: 16 }}></i>
                            <h5 style={{ color: "var(--text-muted)" }}>
                                {currentUser ? "No orders yet. Start ordering!" : "Sign in to view your orders, or search by Order ID above."}
                            </h5>
                        </div>
                    ) : (
                        <Row>
                            <Col lg="12">
                                {displayOrders.map((order) => (
                                    <OrderCard key={order._id} order={order} currentUser={currentUser} />
                                ))}
                            </Col>
                        </Row>
                    )}
                </Container>
            </section>
        </Helmet>
    );
};

export default OrderStatus;
