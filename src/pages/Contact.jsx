import React, { useState } from "react";
import { Container, Row, Col } from "reactstrap";
import { motion } from "framer-motion";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/common-section/CommonSection";

const Contact = () => {
    const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
    const [sent, setSent] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = (e) => {
        e.preventDefault();
        setSent(true);
        setTimeout(() => setSent(false), 4000);
        setForm({ name: "", email: "", subject: "", message: "" });
    };

    const info = [
        { icon: "ri-map-pin-2-line", title: "Address", value: "123 Food Street, Flavor Town, NY 10001" },
        { icon: "ri-phone-line", title: "Phone", value: "+1 (555) 123-4567" },
        { icon: "ri-mail-line", title: "Email", value: "hello@smartbite.com" },
        { icon: "ri-time-line", title: "Hours", value: "Mon–Fri: 10AM–11PM" },
    ];

    return (
        <Helmet title="Contact Us">
            <CommonSection title="Contact Us" />
            <section style={{ padding: "60px 0 80px" }}>
                <Container>
                    <Row>
                        <Col lg="5" className="mb-5">
                            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                                <h2 style={{ marginBottom: 12 }}>Get in Touch</h2>
                                <p style={{ color: "var(--text-muted)", marginBottom: 32, lineHeight: 1.7 }}>
                                    Have a question, feedback, or just want to say hi? We'd love to hear from you.
                                </p>

                                {info.map((item) => (
                                    <div key={item.title} className="d-flex align-items-start gap-3 mb-4">
                                        <div style={{
                                            width: 44, height: 44, borderRadius: "50%",
                                            background: "rgba(255,107,53,0.1)",
                                            border: "1px solid rgba(255,107,53,0.2)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            color: "var(--primary)", fontSize: "1.1rem", flexShrink: 0,
                                        }}>
                                            <i className={item.icon}></i>
                                        </div>
                                        <div>
                                            <h6 style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 2 }}>{item.title}</h6>
                                            <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </Col>

                        <Col lg="7">
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                style={{
                                    background: "var(--bg-card)",
                                    border: "1px solid var(--border)",
                                    borderRadius: "var(--radius)",
                                    padding: "36px",
                                }}
                            >
                                {sent && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        style={{
                                            background: "rgba(76,175,80,0.1)",
                                            border: "1px solid rgba(76,175,80,0.3)",
                                            borderRadius: "var(--radius-sm)",
                                            padding: "12px 16px",
                                            marginBottom: 20,
                                            color: "var(--success)",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        <i className="ri-checkbox-circle-line me-2"></i>
                                        Message sent! We'll get back to you soon.
                                    </motion.div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <Row>
                                        <Col lg="6">
                                            <div className="form__group mb-3">
                                                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>Name</label>
                                                <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" required className="input-custom" />
                                            </div>
                                        </Col>
                                        <Col lg="6">
                                            <div className="form__group mb-3">
                                                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>Email</label>
                                                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required className="input-custom" />
                                            </div>
                                        </Col>
                                        <Col lg="12">
                                            <div className="form__group mb-3">
                                                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>Subject</label>
                                                <input name="subject" value={form.subject} onChange={handleChange} placeholder="How can we help?" required className="input-custom" />
                                            </div>
                                        </Col>
                                        <Col lg="12">
                                            <div className="form__group mb-4">
                                                <label style={{ display: "block", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 8 }}>Message</label>
                                                <textarea
                                                    name="message"
                                                    value={form.message}
                                                    onChange={handleChange}
                                                    placeholder="Tell us more..."
                                                    required
                                                    rows={5}
                                                    className="input-custom"
                                                    style={{ resize: "vertical" }}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                    <button type="submit" className="btn-primary-custom w-100" style={{ padding: "14px" }}>
                                        <i className="ri-send-plane-line me-2"></i>Send Message
                                    </button>
                                </form>
                            </motion.div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </Helmet>
    );
};

export default Contact;
