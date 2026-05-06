import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/common-section/CommonSection";
import { Container, Row, Col } from "reactstrap";
import ExtraIngredient from "../components/ExtraIngredient/ExtraIngredient.jsx";
import { useDispatch, useSelector } from "react-redux";
import { cartActions } from "../store/shopping-cart/cartSlice";
import { motion } from "framer-motion";
import { getProduct, getProducts } from "../api/products";
import localProducts from "../assets/fake-data/products";
import FavoriteBtn from "../components/UI/FavoriteBtn/FavoriteBtn";
import ProductReviews from "../components/UI/Reviews/ProductReviews";
import "../styles/product-details.css";
import ProductCard from "../components/UI/product-card/ProductCard";

const EXTRA_INGREDIENTS = [
  "Mushrooms", "Onion", "Pepper", "Pineapple",
  "Tuna", "Meat", "Cheese", "Hot Sauce", "Corn",
];

const PizzaDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((s) => s.cart.cartItems);

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImg, setPreviewImg] = useState("");
  const [extraIngredients, setExtras] = useState([]);
  const [notification, setNotification] = useState(false);

  // Fetch product from API, fall back to local data if API fails
  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then(({ data }) => {
        const p = { ...data.product, id: data.product._id };
        setProduct(p);
        setPreviewImg(p.image01);
        window.scrollTo(0, 0);
        const inCart = cartItems.find((c) => c.id === p._id);
        setExtras(inCart?.extraIngredients || []);
        return getProducts({ category: p.category });
      })
      .then(({ data }) => {
        setRelated(
          data.products
            .filter((p) => p._id !== id)
            .slice(0, 4)
            .map((p) => ({ ...p, id: p._id }))
        );
      })
      .catch(() => {
        // Fall back to local data
        const local = localProducts.find((p) => p.id === id);
        if (local) {
          setProduct(local);
          setPreviewImg(local.image01);
          window.scrollTo(0, 0);
          const inCart = cartItems.find((c) => c.id === local.id);
          setExtras(inCart?.extraIngredients || []);
          setRelated(
            localProducts
              .filter((p) => p.category === local.category && p.id !== id)
              .slice(0, 4)
          );
        } else {
          setProduct(null);
        }
      })
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line

  const inCart = product ? cartItems.find((c) => c.id === product._id) : null;

  const addItem = () => {
    if (!product) return;
    dispatch(cartActions.addItem({
      id: product._id,
      title: product.title,
      price: product.price,
      image01: product.image01,
      extraIngredients,
    }));
    setNotification(true);
    setTimeout(() => setNotification(false), 3000);
  };

  const toggleIngredient = (ing) => {
    setExtras((prev) =>
      prev.includes(ing) ? prev.filter((i) => i !== ing) : [...prev, ing]
    );
  };

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <i className="ri-loader-4-line" style={{ fontSize: "3rem", color: "var(--primary)", animation: "reg-spin 1s linear infinite", display: "inline-block" }}></i>
    </div>
  );

  if (!product) return (
    <div style={{ padding: "140px 20px", textAlign: "center", color: "var(--text-muted)" }}>
      <i className="ri-error-warning-line" style={{ fontSize: "3rem", display: "block", marginBottom: 12 }}></i>
      <h5>Product not found.</h5>
      <button className="btn-primary-custom mt-3" onClick={() => navigate("/pizzas")}>
        Back to Menu
      </button>
    </div>
  );

  const { title, price, category, desc, image01, image02, image03 } = product;

  return (
    <Helmet title={title}>
      {notification && (
        <motion.div className="updateCartNotifiation"
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <i className="ri-checkbox-circle-line me-2"></i>
          {inCart ? "Cart updated!" : "Added to cart!"}
        </motion.div>
      )}

      <CommonSection title={title} />

      <section className="product__details-section">
        <Container>
          <Row>
            {/* Thumbnails */}
            <Col lg="2" md="2">
              <div className="product__images">
                {[image01, image02, image03].filter(Boolean).map((img, i) => (
                  <div key={i}
                    className={`img__item ${previewImg === img ? "active" : ""}`}
                    onClick={() => setPreviewImg(img)}>
                    <img src={img} alt="" />
                  </div>
                ))}
              </div>
            </Col>

            {/* Main image */}
            <Col lg="4" md="4">
              <motion.div className="product__main-img"
                key={previewImg} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                <img src={previewImg} alt={title} />
              </motion.div>
            </Col>

            {/* Info */}
            <Col lg="6" md="6">
              <div className="single__product-content">
                <h2 className="product__title mb-3">{title}</h2>
                <p className="product__price">Price: <span>₹{price}</span></p>
                <p className="category mb-4">Category: <span>{category}</span></p>
                <div className="d-flex align-items-center gap-3">
                  <button onClick={addItem} className="addTOCART__btn">
                    <i className={`ri-${inCart ? "refresh-line" : "shopping-cart-line"} me-2`}></i>
                    {inCart ? "Update Cart" : "Add to Cart"}
                  </button>
                  <FavoriteBtn item={product} size="lg" />
                </div>
              </div>
            </Col>

            {/* Extra ingredients (Pizza only) */}
            {category === "Pizza" && (
              <Col lg="12" className="mt-4">
                <h6 style={{ color: "var(--primary)", marginBottom: 16, fontWeight: 700 }}>
                  Customize Your Order
                </h6>
                <div className="extraIngredientsGrid">
                  {EXTRA_INGREDIENTS.map((ing) => (
                    <ExtraIngredient key={ing} ingredient={ing}
                      isChecked={extraIngredients.includes(ing)}
                      onSelect={toggleIngredient} />
                  ))}
                </div>
              </Col>
            )}

            {/* Description */}
            <Col lg="12" className="mt-4">
              <h6 className="description">Description</h6>
              <div className="description__content"><p>{desc}</p></div>
            </Col>

            {/* Reviews */}
            <Col lg="12">
              <ProductReviews
                productId={product._id || product.id}
                productRating={product.ratings || 0}
                numReviews={product.numReviews || 0}
              />
            </Col>

            {/* Related */}
            {related.length > 0 && (
              <>
                <Col lg="12" className="mb-4 mt-4">
                  <h2 className="related__Product-title">You Might Also Like</h2>
                </Col>
                {related.map((item) => (
                  <Col lg="3" md="4" sm="6" xs="6" className="mb-4" key={item._id}>
                    <ProductCard item={{ ...item, id: item._id }} />
                  </Col>
                ))}
              </>
            )}
          </Row>
        </Container>
      </section>
    </Helmet>
  );
};

export default PizzaDetails;
