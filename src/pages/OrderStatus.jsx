import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import { getMyOrders, trackOrder } from "../api/orders";
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

const OrderCard = ({ order }) => (
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
                        <div style={{ flex: 2, height: 2, background: step.done ? "var(--primary)" : "var(--border)", marginBottom: 28, transition: "background 0.3s" }}></div>
                    )}
                </div>
            ))}
        </div>

        {/* Items */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: 10 }}>Items Ordered</div>
            <div className="d-flex flex-wrap gap-2">
                {order.items?.map((item, i) => (
                    <div key={i} className="d-flex align-items-center gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 8, padding: "8px 12px" }}>
                        <img src={item.image01} alt={item.title} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }} />
                        <div>
                            <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{item.title}</div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>x{item.quantity}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </motion.div>
);

const OrderStatus = () => {
    const currentUser = useSelector((s) => s.auth.currentUser);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchId, setSearchId] = useState("");
    const [searchResult, setSearchResult] = useState(null);
    const [searchErr, setSearchErr] = useState("");

    useEffect(() => {
        if (!currentUser) return;

        const fetchOrders = () => {
            getMyOrders()
                .then(({ data }) => setOrders(data.orders))
                .catch(console.error)
                .finally(() => setLoading(false));
        };

        setLoading(true);
        fetchOrders();

        // Auto-refresh every 30s to show live timeline progress
        const interval = setInterval(fetchOrders, 30000);
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
                                {displayOrders.map((order) => <OrderCard key={order._id} order={order} />)}
                            </Col>
                        </Row>
                    )}
                </Container>
            </section>
        </Helmet>
    );
};

export default OrderStatus;
