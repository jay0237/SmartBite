import React, { useState, useEffect } from "react";
import Helmet from "../components/Helmet/Helmet.js";
import { Container, Row, Col } from "reactstrap";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import guyImg from "../assets/images/delivery-guy.png";
import "../styles/hero-section.css";
import { getProducts } from "../api/products";
import localProducts from "../assets/fake-data/products";
import ProductCard from "../components/UI/product-card/ProductCard";

const categories = [
  { name: "Burgers", emoji: "🍔" },
  { name: "Pizza", emoji: "🍕" },
  { name: "Sushi", emoji: "🍣" },
  { name: "Drinks", emoji: "🥤" },
  { name: "Snacks", emoji: "🍟" },
  { name: "Desserts", emoji: "🍰" },
];

const features = [
  { icon: "ri-timer-flash-line", title: "30-Min Delivery", desc: "Hot food at your door in 30 minutes or your next order is free." },
  { icon: "ri-shield-check-line", title: "Fresh Ingredients", desc: "We source only the freshest, highest-quality ingredients daily." },
  { icon: "ri-map-pin-2-line", title: "Live Tracking", desc: "Track your order in real-time from kitchen to your doorstep." },
  { icon: "ri-customer-service-2-line", title: "24/7 Support", desc: "Our support team is always here to help you anytime." },
];

const testimonials = [
  { name: "Priya S.", role: "Food Blogger", text: "Smart Bite has completely changed how I order food. The quality is unmatched and delivery is always on time!", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80", stars: 5 },
  { name: "Rahul K.", role: "Regular Customer", text: "Best burgers in the city, hands down. The BBQ Bacon Burger is absolutely incredible. Highly recommend!", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80", stars: 5 },
  { name: "Ananya M.", role: "Office Manager", text: "We order for the whole team every Friday. Smart Bite never disappoints — great variety and always fresh.", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80", stars: 5 },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } },
});

const Home = () => {
  const [popularItems, setPopularItems] = useState([]);

  useEffect(() => {
    getProducts({})
      .then((response) => {
        const list = response?.data?.products;
        if (Array.isArray(list) && list.length > 0) {
          setPopularItems(list.slice(0, 4).map((p) => ({ ...p, id: p._id || p.id })));
        } else {
          setPopularItems(localProducts.slice(0, 4));
        }
      })
      .catch(() => setPopularItems(localProducts.slice(0, 4)));
  }, []);

  return (
    <Helmet title="Home">

      {/* ── Hero ── */}
      <section className="hero__section">
        <Container>
          <Row className="align-items-center">
            <Col lg="6" md="6">
              <div className="hero__content">
                <motion.div className="hero__badge" {...fadeUp(0)}>
                  <span></span> Now delivering in 30 minutes
                </motion.div>

                <motion.h1 className="hero__title" {...fadeUp(0.1)}>
                  Taste the <span className="highlight">Difference</span> with Smart Bite
                </motion.h1>

                <motion.p className="hero__desc" {...fadeUp(0.2)}>
                  From gourmet burgers to artisan pizzas and fresh sushi — we bring
                  restaurant-quality food straight to your door, hot and fresh.
                </motion.p>

                <motion.div className="hero__btns" {...fadeUp(0.3)}>
                  <button className="hero__btn-primary">
                    <Link to="/pizzas" style={{ color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="ri-restaurant-line"></i> Explore Menu
                    </Link>
                  </button>
                  <button className="hero__btn-secondary">
                    <Link to="/order-status" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <i className="ri-map-pin-line"></i> Track Order
                    </Link>
                  </button>
                </motion.div>

                <motion.div className="hero__stats" {...fadeUp(0.4)}>
                  {[["50K+", "Happy Customers"], ["200+", "Menu Items"], ["30 Min", "Avg Delivery"], ["4.9★", "App Rating"]].map(([num, label]) => (
                    <div className="stat__item" key={label}>
                      <span className="stat__number">{num}</span>
                      <span className="stat__label">{label}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </Col>

            <Col lg="6" md="6">
              <motion.div
                className="hero__img-wrapper"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <div className="hero__img-ring"></div>
                <div className="hero__img-ring2"></div>
                <img src={guyImg} alt="delivery" />
                <div className="hero__floating-card card1">
                  <span className="card-icon">🍕</span>
                  <div className="card-text">
                    <span>Just ordered</span>
                    <strong>Margherita Pizza</strong>
                  </div>
                </div>
                <div className="hero__floating-card card2">
                  <span className="card-icon">⚡</span>
                  <div className="card-text">
                    <span>Delivery in</span>
                    <strong>28 minutes</strong>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ── Categories ── */}
      <section className="category__section">
        <Container>
          <div className="text-center mb-5">
            <h2 className="section__title">Browse by Category</h2>
            <p className="section__subtitle">Find exactly what you're craving</p>
          </div>
          <Row>
            {categories.map((cat, i) => (
              <Col lg="2" md="4" sm="4" xs="6" key={cat.name} className="mb-4">
                <motion.div {...fadeUp(i * 0.07)}>
                  <Link to="/pizzas">
                    <div className="category__card">
                      <div style={{ fontSize: "2.5rem", marginBottom: 10 }}>{cat.emoji}</div>
                      <h6>{cat.name}</h6>
                    </div>
                  </Link>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── Popular Items ── */}
      <section style={{ padding: "60px 0" }}>
        <Container>
          <div className="d-flex align-items-center justify-content-between mb-5">
            <div>
              <h2 className="section__title">Popular Right Now</h2>
              <p className="section__subtitle">Our most-loved dishes this week</p>
            </div>
            <Link to="/pizzas" style={{ color: "var(--primary)", fontWeight: 600, fontSize: "0.9rem" }}>
              View All <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
          <Row>
            {popularItems.map((item, i) => (
              <Col lg="3" md="4" sm="6" xs="6" key={item.id} className="mb-4">
                <motion.div {...fadeUp(i * 0.1)}>
                  <ProductCard item={item} />
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "60px 0", background: "var(--bg-light)" }}>
        <Container>
          <div className="text-center mb-5">
            <h2 className="section__title">Why Choose Smart Bite?</h2>
            <p className="section__subtitle">We go above and beyond for every order</p>
          </div>
          <Row>
            {features.map((f, i) => (
              <Col lg="3" md="6" sm="6" key={f.title} className="mb-4">
                <motion.div className="feature__card" {...fadeUp(i * 0.1)}>
                  <div className="feature__icon">
                    <i className={f.icon}></i>
                  </div>
                  <h5>{f.title}</h5>
                  <p>{f.desc}</p>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── Testimonials ── */}
      <section style={{ padding: "60px 0" }}>
        <Container>
          <div className="text-center mb-5">
            <h2 className="section__title">What Our Customers Say</h2>
            <p className="section__subtitle">Real reviews from real food lovers</p>
          </div>
          <Row>
            {testimonials.map((t, i) => (
              <Col lg="4" md="6" key={t.name} className="mb-4">
                <motion.div className="testimonial__card" {...fadeUp(i * 0.1)}>
                  <div className="testimonial__stars">{"★".repeat(t.stars)}</div>
                  <p className="testimonial__text">"{t.text}"</p>
                  <div className="testimonial__author">
                    <img src={t.avatar} alt={t.name} className="testimonial__avatar" />
                    <div className="testimonial__author-info">
                      <span>{t.name}</span>
                      <small>{t.role}</small>
                    </div>
                  </div>
                </motion.div>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: "60px 0" }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              background: "linear-gradient(135deg, var(--primary), var(--primary-dark))",
              borderRadius: "var(--radius)",
              padding: "60px 40px",
              textAlign: "center",
            }}
          >
            <h2 style={{ color: "#fff", fontSize: "2rem", marginBottom: 12 }}>
              Ready to Order?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 28, fontSize: "1rem" }}>
              Join 50,000+ happy customers. Your next favourite meal is just a click away.
            </p>
            <button style={{
              background: "#fff", color: "var(--primary)", border: "none",
              padding: "14px 36px", borderRadius: "50px", fontWeight: 700,
              fontSize: "1rem", cursor: "pointer",
            }}>
              <Link to="/pizzas" style={{ color: "var(--primary)" }}>
                Order Now <i className="ri-arrow-right-line"></i>
              </Link>
            </button>
          </motion.div>
        </Container>
      </section>

    </Helmet>
  );
};

export default Home;
