import React, { useState } from "react";
import "../../../styles/product-card.css";
import { useDispatch } from "react-redux";
import { cartActions } from "../../../store/shopping-cart/cartSlice";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const ProductCard = ({ item }) => {
  const id = item._id || item.id;
  const { title, image01, price, category, desc } = item;
  const dispatch = useDispatch();
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    dispatch(cartActions.addItem({ id, title, image01, price, extraIngredients: [] }));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.div
      className="product__item d-flex flex-column"
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* Clickable area → product detail */}
      <Link to={`/pizzas/${id}`} style={{ textDecoration: "none" }}>
        <div className="product__img-wrapper">
          <img className="product__img" src={image01} alt={title} />
          <span className="product__badge">{category}</span>
        </div>
        <div className="product__content">
          <h5 className="mb-1" style={{ color: "var(--text)" }}>{title}</h5>
          {desc && <p className="product__desc">{desc}</p>}
        </div>
      </Link>

      {/* Footer is OUTSIDE the Link so button works independently */}
      <div className="product__footer mt-auto">
        <span className="product__price">₹{Number(price).toFixed(2)}</span>
        <button
          className="addTOCART__btn"
          onClick={addToCart}
          style={{
            background: added
              ? "linear-gradient(135deg, #4caf50, #388e3c)"
              : undefined,
            transition: "background 0.3s",
          }}
        >
          {added ? (
            <><i className="ri-check-line me-1"></i> Added!</>
          ) : (
            <><i className="ri-shopping-cart-line me-1"></i> Add</>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default ProductCard;
