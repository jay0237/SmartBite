import React, { useState, useEffect, useCallback } from "react";
import { Container, Row, Col } from "reactstrap";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getStats, getAdminOrders, updateOrderStatus, getAdminUsers, deleteUser, updateUserRole, getAdminProducts, createProduct, deleteProduct } from "../api/admin";
import { getRestaurants, createRestaurant, updateRestaurant, deleteRestaurant } from "../api/restaurants";
import Helmet from "../components/Helmet/Helmet";

const STATUS_FLOW = ["Confirmed", "Preparing", "Out for Delivery", "Delivered"];
const statusColors = { Confirmed: "#2196f3", Preparing: "#ff9800", "Out for Delivery": "#9c27b0", Delivered: "#4caf50", Cancelled: "#f44336" };

const Admin = () => {
    const currentUser = useSelector((s) => s.auth.currentUser);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [stats, setStats] = useState(null);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [prodForm, setProdForm] = useState({ title: "", price: "", category: "Burger", image01: "", desc: "" });
    const [prodLoading, setProdLoading] = useState(false);

    // Restaurant state
    const [restaurants, setRestaurants] = useState([]);
    const [showRestForm, setShowRestForm] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState(null);
    const [restForm, setRestForm] = useState({
        name: "", image: "", cuisine: "", rating: "4.5",
        deliveryTime: "30-40 min", location: "", isOpen: true,
        description: "", minOrder: "0", deliveryFee: "0",
    });
    const [restLoading, setRestLoading] = useState(false);

    const isAdmin = currentUser?.role === "admin";

    const load = useCallback(async () => {
        if (!isAdmin) return;
        setLoading(true);
        try {
            if (activeTab === "dashboard") {
                const [s, o] = await Promise.all([getStats(), getAdminOrders()]);
                setStats(s.data.stats);
                setOrders(o.data.orders.slice(0, 5));
            } else if (activeTab === "orders") {
                const { data } = await getAdminOrders();
                setOrders(data.orders);
            } else if (activeTab === "users") {
                const { data } = await getAdminUsers();
                setUsers(data.users);
            } else if (activeTab === "menu") {
                const { data } = await getAdminProducts();
                setProducts(data.products);
            } else if (activeTab === "restaurants") {
                const data = await getRestaurants();
                setRestaurants(data?.data || []);
            }
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    }, [activeTab, isAdmin]);

    useEffect(() => { load(); }, [load]);

    // Early return AFTER all hooks
    if (!currentUser || currentUser.role !== "admin") return <Navigate to="/login" />;

    const handleAdvanceStatus = async (order) => {
        const idx = STATUS_FLOW.indexOf(order.status);
        if (idx >= STATUS_FLOW.length - 1) return;
        const next = STATUS_FLOW[idx + 1];
        try {
            await updateOrderStatus(order._id, next);
            load();
        } catch (err) { console.error(err); }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        await deleteUser(id);
        load();
    };

    const handleRoleToggle = async (user) => {
        const newRole = user.role === "admin" ? "user" : "admin";
        await updateUserRole(user._id, newRole);
        load();
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        await deleteProduct(id);
        load();
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        setProdLoading(true);
        try {
            await createProduct({ ...prodForm, price: Number(prodForm.price) });
            setShowForm(false);
            setProdForm({ title: "", price: "", category: "Burger", image01: "", desc: "" });
            load();
        } catch (err) { console.error(err); }
        finally { setProdLoading(false); }
    };

    // ── Restaurant handlers ──
    const resetRestForm = () => {
        setRestForm({ name: "", image: "", cuisine: "", rating: "4.5", deliveryTime: "30-40 min", location: "", isOpen: true, description: "", minOrder: "0", deliveryFee: "0" });
        setEditingRestaurant(null);
        setShowRestForm(false);
    };

    const handleRestSubmit = async (e) => {
        e.preventDefault();
        setRestLoading(true);
        try {
            const payload = {
                ...restForm,
                cuisine: restForm.cuisine.split(",").map((c) => c.trim()).filter(Boolean),
                rating: Number(restForm.rating),
                minOrder: Number(restForm.minOrder),
                deliveryFee: Number(restForm.deliveryFee),
            };
            if (editingRestaurant) {
                await updateRestaurant(editingRestaurant._id, payload);
            } else {
                await createRestaurant(payload);
            }
            resetRestForm();
            load();
        } catch (err) { console.error(err); }
        finally { setRestLoading(false); }
    };

    const handleEditRestaurant = (r) => {
        setRestForm({
            name: r.name, image: r.image,
            cuisine: Array.isArray(r.cuisine) ? r.cuisine.join(", ") : r.cuisine,
            rating: String(r.rating), deliveryTime: r.deliveryTime,
            location: r.location, isOpen: r.isOpen,
            description: r.description || "",
            minOrder: String(r.minOrder || 0),
            deliveryFee: String(r.deliveryFee || 0),
        });
        setEditingRestaurant(r);
        setShowRestForm(true);
    };

    const handleDeleteRestaurant = async (id) => {
        if (!window.confirm("Delete this restaurant?")) return;
        await deleteRestaurant(id);
        load();
    };

    const card = { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px" };
    const tabs = [
        { id: "dashboard", label: "Dashboard", icon: "ri-dashboard-line" },
        { id: "orders", label: "Orders", icon: "ri-file-list-3-line" },
        { id: "menu", label: "Menu", icon: "ri-restaurant-line" },
        { id: "restaurants", label: "Restaurants", icon: "ri-store-2-line" },
        { id: "users", label: "Users", icon: "ri-group-line" },
    ];

    return (
        <Helmet title="Admin Panel">
            <div style={{ paddingTop: 80, minHeight: "100vh" }}>
                <Container fluid style={{ maxWidth: 1400 }}>
                    <Row>
                        {/* Sidebar */}
                        <Col lg="2" md="3" className="mb-4">
                            <div style={{ ...card, position: "sticky", top: 100 }}>
                                <div style={{ marginBottom: 24 }}>
                                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2rem", color: "#fff", marginBottom: 8 }}>
                                        {currentUser.name.charAt(0)}
                                    </div>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{currentUser.name}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--primary)" }}>Administrator</div>
                                </div>
                                {tabs.map((tab) => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                                        display: "flex", alignItems: "center", gap: 10, width: "100%",
                                        padding: "10px 12px", borderRadius: "var(--radius-sm)", border: "none",
                                        cursor: "pointer", marginBottom: 4,
                                        background: activeTab === tab.id ? "rgba(255,107,53,0.15)" : "transparent",
                                        color: activeTab === tab.id ? "var(--primary)" : "var(--text-muted)",
                                        fontWeight: activeTab === tab.id ? 600 : 400, fontSize: "0.85rem",
                                    }}>
                                        <i className={tab.icon}></i> {tab.label}
                                    </button>
                                ))}
                            </div>
                        </Col>

                        {/* Main */}
                        <Col lg="10" md="9">
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }} style={{ padding: "20px 0 60px" }}>

                                {loading ? (
                                    <div className="text-center py-5">
                                        <i className="ri-loader-4-line" style={{ fontSize: "2.5rem", color: "var(--primary)", animation: "reg-spin 1s linear infinite", display: "inline-block" }}></i>
                                    </div>
                                ) : (
                                    <>
                                        {/* ── Dashboard ── */}
                                        {activeTab === "dashboard" && stats && (
                                            <>
                                                <h4 style={{ marginBottom: 24 }}>Dashboard Overview</h4>
                                                <Row className="mb-4">
                                                    {[
                                                        { label: "Total Revenue", value: `₹${stats.totalRevenue?.toFixed(2)}`, icon: "ri-money-rupee-circle-line", color: "#4caf50" },
                                                        { label: "Total Orders", value: stats.totalOrders, icon: "ri-file-list-3-line", color: "#2196f3" },
                                                        { label: "Delivered", value: stats.delivered, icon: "ri-checkbox-circle-line", color: "#4caf50" },
                                                        { label: "Pending", value: stats.pending, icon: "ri-time-line", color: "#ff9800" },
                                                        { label: "Menu Items", value: stats.totalProducts, icon: "ri-restaurant-line", color: "var(--primary)" },
                                                        { label: "Users", value: stats.totalUsers, icon: "ri-group-line", color: "#9c27b0" },
                                                    ].map((s) => (
                                                        <Col lg="4" md="6" key={s.label} className="mb-3">
                                                            <div style={{ ...card, display: "flex", alignItems: "center", gap: 16 }}>
                                                                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `${s.color}20`, border: `1px solid ${s.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", color: s.color, flexShrink: 0 }}>
                                                                    <i className={s.icon}></i>
                                                                </div>
                                                                <div>
                                                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{s.label}</div>
                                                                    <div style={{ fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</div>
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                                <h5 style={{ marginBottom: 16 }}>Recent Orders</h5>
                                                <OrderTable orders={orders} onAdvance={handleAdvanceStatus} />
                                            </>
                                        )}

                                        {/* ── Orders ── */}
                                        {activeTab === "orders" && (
                                            <>
                                                <h4 style={{ marginBottom: 24 }}>All Orders ({orders.length})</h4>
                                                <OrderTable orders={orders} onAdvance={handleAdvanceStatus} full />
                                            </>
                                        )}

                                        {/* ── Menu ── */}
                                        {activeTab === "menu" && (
                                            <>
                                                <div className="d-flex align-items-center justify-content-between mb-4">
                                                    <h4 style={{ margin: 0 }}>Menu Items ({products.length})</h4>
                                                    <button onClick={() => setShowForm(!showForm)} className="btn-primary-custom" style={{ padding: "10px 20px" }}>
                                                        <i className={`ri-${showForm ? "close" : "add"}-line me-2`}></i>
                                                        {showForm ? "Cancel" : "Add Item"}
                                                    </button>
                                                </div>

                                                <AnimatePresence>
                                                    {showForm && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                                            style={{ ...card, marginBottom: 24, overflow: "hidden" }}>
                                                            <h6 style={{ marginBottom: 16 }}>Add New Menu Item</h6>
                                                            <form onSubmit={handleCreateProduct}>
                                                                <Row>
                                                                    {[
                                                                        { name: "title", label: "Title", col: 6, type: "text", placeholder: "Classic Burger" },
                                                                        { name: "price", label: "Price (₹)", col: 3, type: "number", placeholder: "299" },
                                                                        { name: "image01", label: "Image URL", col: 9, type: "text", placeholder: "https://..." },
                                                                        { name: "desc", label: "Description", col: 12, type: "text", placeholder: "Describe the item..." },
                                                                    ].map((f) => (
                                                                        <Col lg={f.col} key={f.name} className="mb-3">
                                                                            <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>{f.label}</label>
                                                                            <input type={f.type} placeholder={f.placeholder} value={prodForm[f.name]}
                                                                                onChange={(e) => setProdForm({ ...prodForm, [f.name]: e.target.value })}
                                                                                required className="input-custom" />
                                                                        </Col>
                                                                    ))}
                                                                    <Col lg="3" className="mb-3">
                                                                        <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Category</label>
                                                                        <select value={prodForm.category} onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })} className="input-custom">
                                                                            {["Burger", "Pizza", "Sushi", "Drinks", "Snacks", "Desserts"].map((c) => <option key={c}>{c}</option>)}
                                                                        </select>
                                                                    </Col>
                                                                </Row>
                                                                <button type="submit" className="btn-primary-custom" disabled={prodLoading} style={{ padding: "10px 24px" }}>
                                                                    {prodLoading ? "Adding..." : "Add Item"}
                                                                </button>
                                                            </form>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                <Row>
                                                    {products.map((p) => (
                                                        <Col lg="4" md="6" key={p._id} className="mb-3">
                                                            <div style={{ ...card, display: "flex", gap: 14, alignItems: "center" }}>
                                                                <img src={p.image01} alt={p.title} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, flexShrink: 0 }} />
                                                                <div className="flex-grow-1">
                                                                    <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 2 }}>{p.title}</div>
                                                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 4 }}>{p.category}</div>
                                                                    <div style={{ fontWeight: 700, color: "var(--primary)" }}>₹{p.price}</div>
                                                                </div>
                                                                <button onClick={() => handleDeleteProduct(p._id)}
                                                                    style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", color: "#f44336", padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: "0.85rem" }}>
                                                                    <i className="ri-delete-bin-line"></i>
                                                                </button>
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </>
                                        )}

                                        {/* ── Restaurants ── */}
                                        {activeTab === "restaurants" && (
                                            <>
                                                <div className="d-flex align-items-center justify-content-between mb-4">
                                                    <h4 style={{ margin: 0 }}>Restaurants ({restaurants.length})</h4>
                                                    <button onClick={() => { resetRestForm(); setShowRestForm(!showRestForm); }} className="btn-primary-custom" style={{ padding: "10px 20px" }}>
                                                        <i className={`ri-${showRestForm && !editingRestaurant ? "close" : "add"}-line me-2`}></i>
                                                        {showRestForm && !editingRestaurant ? "Cancel" : "Add Restaurant"}
                                                    </button>
                                                </div>

                                                <AnimatePresence>
                                                    {showRestForm && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                                                            style={{ ...card, marginBottom: 24, overflow: "hidden" }}>
                                                            <h6 style={{ marginBottom: 16 }}>{editingRestaurant ? "Edit Restaurant" : "Add New Restaurant"}</h6>
                                                            <form onSubmit={handleRestSubmit}>
                                                                <Row>
                                                                    <Col lg="6" className="mb-3">
                                                                        <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Restaurant Name *</label>
                                                                        <input type="text" placeholder="e.g. Pizzeria Bella" value={restForm.name} onChange={(e) => setRestForm({ ...restForm, name: e.target.value })} required className="input-custom" />
                                                                    </Col>
                                                                    <Col lg="6" className="mb-3">
                                                                        <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Image URL *</label>
                                                                        <input type="text" placeholder="https://..." value={restForm.image} onChange={(e) => setRestForm({ ...restForm, image: e.target.value })} required className="input-custom" />
                                                                    </Col>
                                                                    <Col lg="6" className="mb-3">
                                                                        <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Cuisine (comma-separated) *</label>
                                                                        <input type="text" placeholder="Italian, Pizza" value={restForm.cuisine} onChange={(e) => setRestForm({ ...restForm, cuisine: e.target.value })} required className="input-custom" />
                                                                    </Col>
                                                                    <Col lg="3" className="mb-3">
                                                                        <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Rating (0–5)</label>
                                                                        <input type="number" step="0.1" min="0" max="5" value={restForm.rating} onChange={(e) => setRestForm({ ...restForm, rating: e.target.value })} className="input-custom" />
                                                                    </Col>
                                                                    <Col lg="3" className="mb-3">
                                                                        <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Delivery Time</label>
                                                                        <input type="text" placeholder="30-40 min" value={restForm.deliveryTime} onChange={(e) => setRestForm({ ...restForm, deliveryTime: e.target.value })} className="input-custom" />
                                                                    </Col>
                                                                    <Col lg="6" className="mb-3">
                                                                        <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Location *</label>
                                                                        <input type="text" placeholder="Downtown, City Center" value={restForm.location} onChange={(e) => setRestForm({ ...restForm, location: e.target.value })} required className="input-custom" />
                                                                    </Col>
                                                                    <Col lg="3" className="mb-3">
                                                                        <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Min Order (₹)</label>
                                                                        <input type="number" min="0" value={restForm.minOrder} onChange={(e) => setRestForm({ ...restForm, minOrder: e.target.value })} className="input-custom" />
                                                                    </Col>
                                                                    <Col lg="3" className="mb-3">
                                                                        <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Delivery Fee (₹)</label>
                                                                        <input type="number" min="0" value={restForm.deliveryFee} onChange={(e) => setRestForm({ ...restForm, deliveryFee: e.target.value })} className="input-custom" />
                                                                    </Col>
                                                                    <Col lg="12" className="mb-3">
                                                                        <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Description</label>
                                                                        <input type="text" placeholder="Short description..." value={restForm.description} onChange={(e) => setRestForm({ ...restForm, description: e.target.value })} className="input-custom" />
                                                                    </Col>
                                                                    <Col lg="3" className="mb-3">
                                                                        <label style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "block", marginBottom: 6 }}>Status</label>
                                                                        <select value={restForm.isOpen} onChange={(e) => setRestForm({ ...restForm, isOpen: e.target.value === "true" })} className="input-custom">
                                                                            <option value="true">Open</option>
                                                                            <option value="false">Closed</option>
                                                                        </select>
                                                                    </Col>
                                                                </Row>
                                                                <div className="d-flex gap-2">
                                                                    <button type="submit" className="btn-primary-custom" disabled={restLoading} style={{ padding: "10px 24px" }}>
                                                                        {restLoading ? "Saving..." : editingRestaurant ? "Update Restaurant" : "Add Restaurant"}
                                                                    </button>
                                                                    {editingRestaurant && (
                                                                        <button type="button" onClick={resetRestForm} style={{ padding: "10px 20px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", borderRadius: 8, cursor: "pointer" }}>
                                                                            Cancel
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </form>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>

                                                {restaurants.length === 0 ? (
                                                    <div style={{ ...card, textAlign: "center", padding: 60 }}>
                                                        <i className="ri-store-2-line" style={{ fontSize: "3rem", color: "var(--text-muted)", display: "block", marginBottom: 12 }}></i>
                                                        <p style={{ color: "var(--text-muted)" }}>No restaurants yet. Add one above.</p>
                                                    </div>
                                                ) : (
                                                    <Row>
                                                        {restaurants.map((r) => (
                                                            <Col lg="4" md="6" key={r._id} className="mb-3">
                                                                <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                                                                    <div style={{ position: "relative", height: 140 }}>
                                                                        <img src={r.image} alt={r.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                                                        <span style={{ position: "absolute", top: 10, right: 10, padding: "4px 10px", borderRadius: 20, fontSize: "0.72rem", fontWeight: 700, background: r.isOpen ? "rgba(76,175,80,0.9)" : "rgba(244,67,54,0.9)", color: "#fff" }}>
                                                                            {r.isOpen ? "Open" : "Closed"}
                                                                        </span>
                                                                    </div>
                                                                    <div style={{ padding: "14px" }}>
                                                                        <div style={{ fontWeight: 700, fontSize: "0.95rem", marginBottom: 4 }}>{r.name}</div>
                                                                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: 4 }}>
                                                                            {Array.isArray(r.cuisine) ? r.cuisine.join(", ") : r.cuisine}
                                                                        </div>
                                                                        <div className="d-flex align-items-center justify-content-between" style={{ marginBottom: 12 }}>
                                                                            <span style={{ fontSize: "0.82rem" }}>⭐ {r.rating} • 🚚 {r.deliveryTime}</span>
                                                                            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>📍 {r.location}</span>
                                                                        </div>
                                                                        <div className="d-flex gap-2">
                                                                            <button onClick={() => handleEditRestaurant(r)} style={{ flex: 1, background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.3)", color: "var(--primary)", padding: "6px 0", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
                                                                                <i className="ri-edit-line me-1"></i> Edit
                                                                            </button>
                                                                            <button onClick={() => handleDeleteRestaurant(r._id)} style={{ flex: 1, background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", color: "#f44336", padding: "6px 0", borderRadius: 8, cursor: "pointer", fontSize: "0.82rem", fontWeight: 600 }}>
                                                                                <i className="ri-delete-bin-line me-1"></i> Delete
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                )}
                                            </>
                                        )}

                                        {/* ── Users ── */}
                                        {activeTab === "users" && (
                                            <>
                                                <h4 style={{ marginBottom: 24 }}>Registered Users ({users.length})</h4>
                                                <div style={card}>
                                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                                        <thead>
                                                            <tr>
                                                                {["#", "Name", "Email", "Role", "Joined", "Actions"].map((h) => (
                                                                    <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "0.78rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {users.map((user, i) => (
                                                                <tr key={user._id}>
                                                                    <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.85rem" }}>{i + 1}</td>
                                                                    <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", fontWeight: 600 }}>
                                                                        <div className="d-flex align-items-center gap-2">
                                                                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, var(--primary), var(--accent))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.85rem", color: "#fff" }}>
                                                                                {user.name.charAt(0)}
                                                                            </div>
                                                                            {user.name}
                                                                        </div>
                                                                    </td>
                                                                    <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", color: "var(--text-muted)", fontSize: "0.85rem" }}>{user.email}</td>
                                                                    <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                                                                        <span style={{ padding: "4px 12px", borderRadius: "50px", fontSize: "0.75rem", fontWeight: 600, background: user.role === "admin" ? "rgba(255,107,53,0.15)" : "rgba(33,150,243,0.15)", color: user.role === "admin" ? "var(--primary)" : "#2196f3" }}>
                                                                            {user.role}
                                                                        </span>
                                                                    </td>
                                                                    <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                                    </td>
                                                                    <td style={{ padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                                                                        <div className="d-flex gap-2">
                                                                            <button onClick={() => handleRoleToggle(user)}
                                                                                style={{ background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.3)", color: "var(--primary)", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.75rem" }}>
                                                                                {user.role === "admin" ? "→ User" : "→ Admin"}
                                                                            </button>
                                                                            {user._id !== currentUser._id && (
                                                                                <button onClick={() => handleDeleteUser(user._id)}
                                                                                    style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", color: "#f44336", padding: "4px 10px", borderRadius: 6, cursor: "pointer", fontSize: "0.75rem" }}>
                                                                                    Delete
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </Helmet>
    );
};

// Reusable order table
const OrderTable = ({ orders, onAdvance, full }) => {
    const card = { background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "24px" };
    if (orders.length === 0) return (
        <div style={{ ...card, textAlign: "center", padding: 60 }}>
            <i className="ri-file-list-3-line" style={{ fontSize: "3rem", color: "var(--text-muted)", display: "block", marginBottom: 12 }}></i>
            <p style={{ color: "var(--text-muted)" }}>No orders yet.</p>
        </div>
    );

    if (full) return (
        <div>
            {orders.map((order) => (
                <div key={order._id} style={{ ...card, marginBottom: 16 }}>
                    <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
                        <div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Order ID</div>
                            <div style={{ fontWeight: 700, color: "var(--primary)", fontSize: "0.85rem" }}>{order._id}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Customer</div>
                            <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{order.customer?.name || order.user?.name || "Guest"}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Total</div>
                            <div style={{ fontWeight: 700, color: "var(--primary)" }}>₹{Number(order.total).toFixed(2)}</div>
                        </div>
                        <div>
                            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>Date</div>
                            <div style={{ fontSize: "0.82rem" }}>{new Date(order.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <span style={{ padding: "6px 14px", borderRadius: "50px", background: `${statusColors[order.status]}20`, color: statusColors[order.status], fontWeight: 700, fontSize: "0.8rem" }}>
                                {order.status}
                            </span>
                            {order.status !== "Delivered" && order.status !== "Cancelled" && (
                                <button onClick={() => onAdvance(order)} style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", border: "none", color: "#fff", padding: "6px 16px", borderRadius: "50px", fontSize: "0.8rem", cursor: "pointer", fontWeight: 600 }}>
                                    Next Stage →
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                        {order.items?.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 8, padding: "6px 10px" }}>
                                <img src={item.image01} alt={item.title} style={{ width: 28, height: 28, objectFit: "cover", borderRadius: 4 }} />
                                <span style={{ fontSize: "0.78rem" }}>{item.title} x{item.quantity}</span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div style={card}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                    <tr>
                        {["Order ID", "Customer", "Total", "Status", "Action"].map((h) => (
                            <th key={h} style={{ padding: "10px 12px", textAlign: "left", fontSize: "0.78rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border)", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {orders.map((order) => (
                        <tr key={order._id}>
                            <td style={{ padding: "12px", fontSize: "0.78rem", color: "var(--primary)", fontWeight: 600, borderBottom: "1px solid var(--border)" }}>{order._id?.slice(-8)}...</td>
                            <td style={{ padding: "12px", fontSize: "0.82rem", borderBottom: "1px solid var(--border)" }}>{order.customer?.name || "Guest"}</td>
                            <td style={{ padding: "12px", fontSize: "0.82rem", fontWeight: 700, borderBottom: "1px solid var(--border)" }}>₹{Number(order.total).toFixed(2)}</td>
                            <td style={{ padding: "12px", borderBottom: "1px solid var(--border)" }}>
                                <span style={{ padding: "4px 10px", borderRadius: "50px", background: `${statusColors[order.status]}20`, color: statusColors[order.status], fontSize: "0.75rem", fontWeight: 600 }}>
                                    {order.status}
                                </span>
                            </td>
                            <td style={{ padding: "12px", borderBottom: "1px solid var(--border)" }}>
                                {order.status !== "Delivered" && order.status !== "Cancelled" && (
                                    <button onClick={() => onAdvance(order)} style={{ background: "rgba(255,107,53,0.1)", border: "1px solid rgba(255,107,53,0.3)", color: "var(--primary)", padding: "4px 12px", borderRadius: "50px", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}>
                                        Advance →
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Admin;
