import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { createPaymentOrder, verifyPayment } from "../api/payment";
import { cartActions } from "../store/shopping-cart/cartSlice";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/common-section/CommonSection";
import "../styles/checkout.css";

// Load Razorpay script dynamically
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Checkout = () => {
  const cartItems = useSelector((s) => s.cart.cartItems);
  const totalAmount = useSelector((s) => s.cart.totalAmount);
  const currentUser = useSelector((s) => s.auth.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [placed, setPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: "",
    address: "",
    city: "",
    payment: "razorpay",
  });

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.payment === "razorpay") {
      await handleRazorpayPayment();
    } else {
      await handleCOD();
    }
  };

  // ── Razorpay Payment ──────────────────────────────────────
  const handleRazorpayPayment = async () => {
    setLoading(true);

    const loaded = await loadRazorpay();
    if (!loaded) {
      setError("Failed to load payment gateway. Check your internet connection.");
      setLoading(false);
      return;
    }

    try {
      // 1. Create Razorpay order on backend
      const { data } = await createPaymentOrder(totalAmount);
      const rzpOrder = data.order;

      // 2. Open Razorpay checkout popup
      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: "INR",
        name: "Smart Bite",
        description: "Food Order Payment",
        order_id: rzpOrder.id,
        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },
        theme: { color: "#ff6b35" },
        handler: async (response) => {
          // 3. Verify payment on backend → saves order → sends receipt email
          try {
            const { data: verifyData } = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderData: {
                items: cartItems.map((item) => ({
                  product: item.id || item._id,
                  title: item.title,
                  image01: item.image01,
                  price: item.price,
                  quantity: item.quantity,
                  extraIngredients: item.extraIngredients || [],
                })),
                total: totalAmount,
                customer: form,
              },
            });

            dispatch(cartActions.clearCart());
            setOrderId(verifyData.order._id);
            setPlaced(true);
          } catch (err) {
            setError("Payment verified but order saving failed. Contact support.");
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError("Payment cancelled. Please try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.response?.data?.message || "Payment initiation failed.");
      setLoading(false);
    }
  };

  // ── Cash on Delivery ──────────────────────────────────────
  const handleCOD = async () => {
    setLoading(true);
    try {
      const { placeOrder } = await import("../api/orders");
      const { data } = await placeOrder({
        items: cartItems.map((item) => ({
          product: item.id || item._id,
          title: item.title,
          image01: item.image01,
          price: item.price,
          quantity: item.quantity,
          extraIngredients: item.extraIngredients || [],
        })),
        total: totalAmount,
        customer: form,
      });
      dispatch(cartActions.clearCart());
      setOrderId(data.order._id);
      setPlaced(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  // ── Success Screen ────────────────────────────────────────
  if (placed) {
    return (
      <Helmet title="Order Placed">
        <div className="checkout__section">
          <motion.div className="checkout__card"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}>
            <div className="checkout__icon-wrapper">
              <i className="ri-checkbox-circle-line"></i>
            </div>
            <h3>Order Placed!</h3>
            <p>
              Thank you! We're preparing your food.<br />
              <span style={{ color: "var(--primary)", fontWeight: 600 }}>
                A receipt has been sent to {form.email}
              </span>
            </p>
            <div className="checkout__order-id">
              Order ID: <span>{orderId}</span>
            </div>
            <div className="checkout__actions">
              <button className="checkout__btn primary" onClick={() => navigate("/order-status")}>
                <i className="ri-map-pin-line me-2"></i>Track Order
              </button>
              <button className="checkout__btn secondary" onClick={() => navigate("/home")}>
                Back to Home
              </button>
            </div>
          </motion.div>
        </div>
      </Helmet>
    );
  }

  // ── Checkout Form ─────────────────────────────────────────
  return (
    <Helmet title="Checkout">
      <CommonSection title="Checkout" />
      <section style={{ padding: "40px 0 80px" }}>
        <Container>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              style={{ background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)", borderRadius: "var(--radius-sm)", padding: "12px 16px", marginBottom: 20, color: "var(--danger)", fontSize: "0.85rem" }}>
              <i className="ri-error-warning-line me-2"></i>{error}
            </motion.div>
          )}

          <Row>
            {/* Delivery Form */}
            <Col lg="7" className="mb-4">
              <motion.div className="checkout__form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h5>Delivery Information</h5>
                <form onSubmit={handleSubmit}>
                  <Row>
                    {[
                      { name: "name", label: "Full Name", col: 6, type: "text", placeholder: "Rahul Sharma" },
                      { name: "email", label: "Email", col: 6, type: "email", placeholder: "rahul@example.com" },
                      { name: "phone", label: "Phone", col: 6, type: "text", placeholder: "+91 98765 43210" },
                      { name: "city", label: "City", col: 6, type: "text", placeholder: "Mumbai" },
                      { name: "address", label: "Full Address", col: 12, type: "text", placeholder: "123 Main St, Apt 4B" },
                    ].map((f) => (
                      <Col lg={f.col} key={f.name}>
                        <div className="form__group">
                          <label>{f.label}</label>
                          <input name={f.name} type={f.type} value={form[f.name]}
                            onChange={handleChange} placeholder={f.placeholder} required />
                        </div>
                      </Col>
                    ))}
                  </Row>

                  {/* Payment Method */}
                  <h5 style={{ marginTop: 24, marginBottom: 16 }}>Payment Method</h5>
                  <div className="d-flex gap-3 flex-wrap mb-4">
                    {[
                      { value: "razorpay", label: "Pay Online", icon: "ri-bank-card-line", desc: "UPI, Cards, Wallets, Net Banking" },
                      { value: "cod", label: "Cash on Delivery", icon: "ri-money-rupee-circle-line", desc: "Pay when your order arrives" },
                    ].map((opt) => (
                      <div key={opt.value}
                        onClick={() => setForm({ ...form, payment: opt.value })}
                        style={{
                          flex: 1, minWidth: 160, padding: "16px", borderRadius: "var(--radius-sm)",
                          border: `2px solid ${form.payment === opt.value ? "var(--primary)" : "var(--border)"}`,
                          background: form.payment === opt.value ? "rgba(255,107,53,0.08)" : "rgba(255,255,255,0.03)",
                          cursor: "pointer", transition: "all 0.2s",
                        }}>
                        <i className={opt.icon} style={{ fontSize: "1.4rem", color: form.payment === opt.value ? "var(--primary)" : "var(--text-muted)", display: "block", marginBottom: 8 }}></i>
                        <div style={{ fontWeight: 600, fontSize: "0.9rem", color: form.payment === opt.value ? "var(--text)" : "var(--text-muted)" }}>{opt.label}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>{opt.desc}</div>
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="addTOCART__btn w-100" style={{ padding: "14px" }} disabled={loading || cartItems.length === 0}>
                    {loading ? (
                      <><i className="ri-loader-4-line me-2" style={{ animation: "reg-spin 0.8s linear infinite", display: "inline-block" }}></i>Processing...</>
                    ) : form.payment === "razorpay" ? (
                      <><i className="ri-secure-payment-line me-2"></i>Pay ₹{Number(totalAmount).toFixed(2)} Securely</>
                    ) : (
                      <><i className="ri-check-line me-2"></i>Place Order — ₹{Number(totalAmount).toFixed(2)}</>
                    )}
                  </button>

                  {form.payment === "razorpay" && (
                    <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 10 }}>
                      <i className="ri-lock-line me-1"></i>
                      Secured by Razorpay. Your payment info is never stored.
                    </p>
                  )}
                </form>
              </motion.div>
            </Col>

            {/* Order Summary */}
            <Col lg="5">
              <motion.div className="checkout__form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h5>Order Summary</h5>
                {cartItems.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Your cart is empty.</p>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.id || item._id} className="d-flex align-items-center gap-3 mb-3">
                      <img src={item.image01} alt={item.title} style={{ width: 50, height: 50, objectFit: "cover", borderRadius: 8 }} />
                      <div className="flex-grow-1">
                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{item.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>x{item.quantity}</div>
                      </div>
                      <span style={{ color: "var(--primary)", fontWeight: 700 }}>
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))
                )}
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 8 }}>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: "var(--text-muted)" }}>Subtotal</span>
                    <span>₹{Number(totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: "var(--text-muted)" }}>Delivery</span>
                    <span style={{ color: "var(--success)" }}>Free</span>
                  </div>
                  <div className="d-flex justify-content-between" style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                    <span>Total</span>
                    <span style={{ color: "var(--primary)" }}>₹{Number(totalAmount).toFixed(2)}</span>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default Checkout;
