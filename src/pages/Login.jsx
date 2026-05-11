import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { motion } from "framer-motion";
import { authActions } from "../store/shopping-cart/authSlice";
import { fetchFavorites } from "../store/shopping-cart/favoritesSlice";
import { login as loginAPI } from "../api/auth";
import Helmet from "../components/Helmet/Helmet";

const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(""); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const { data } = await loginAPI(form);
            dispatch(authActions.setCredentials({ user: data.user, token: data.token }));
            // Load user's favorites immediately after login
            dispatch(fetchFavorites());
            navigate(data.user.role === "admin" ? "/admin" : "/home");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Helmet title="Sign In">
            <div style={{
                minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
                padding: "100px 20px 60px",
                background: "radial-gradient(ellipse at 30% 50%, rgba(0,0,0,0.08) 0%, transparent 60%), var(--bg)",
            }}>
                <Container>
                    <Row className="justify-content-center">
                        <Col lg="5" md="7">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "40px" }}
                            >
                                <div className="text-center mb-4">
                                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.6rem", color: "var(--primary)", margin: "0 auto 16px" }}>
                                        <i className="ri-lock-line"></i>
                                    </div>
                                    <h2 style={{ fontSize: "1.8rem", marginBottom: 8 }}>Welcome Back</h2>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Sign in to your Smart Bite account</p>
                                </div>

                                {error && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: 20, color: "var(--danger)", fontSize: "0.85rem" }}>
                                        <i className="ri-error-warning-line me-2"></i>{error}
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    {[
                                        { name: "email", label: "Email Address", type: "email", placeholder: "you@example.com" },
                                        { name: "password", label: "Password", type: "password", placeholder: "••••••••" },
                                    ].map((f) => (
                                        <div key={f.name} style={{ marginBottom: 16 }}>
                                            <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>{f.label}</label>
                                            <input name={f.name} type={f.type} value={form[f.name]} onChange={handleChange} placeholder={f.placeholder} required className="input-custom" />
                                        </div>
                                    ))}

                                    <button type="submit" disabled={loading} className="btn-primary-custom w-100" style={{ padding: "14px", marginTop: 8, opacity: loading ? 0.7 : 1 }}>
                                        {loading ? <><i className="ri-loader-4-line me-2" style={{ animation: "reg-spin 0.8s linear infinite", display: "inline-block" }}></i>Signing in...</> : "Sign In"}
                                    </button>
                                </form>

                                <div className="text-center mt-4">
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                        Don't have an account?{" "}
                                        <Link to="/register" style={{ color: "var(--primary)", fontWeight: 600 }}>Create one</Link>
                                    </p>
                                </div>

                                <div style={{ marginTop: 20, padding: "12px 16px", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.12)", borderRadius: "var(--radius-sm)", fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                    <strong style={{ color: "var(--primary)" }}>Demo Admin:</strong> admin@smartbite.com / admin123
                                </div>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </div>
        </Helmet>
    );
};

export default Login;
