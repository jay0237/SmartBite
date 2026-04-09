import React from "react";
import { useNavigate } from "react-router-dom";
import CartItem from "./CartItem";
import { useDispatch, useSelector } from "react-redux";
import { cartUiActions } from "../../../store/shopping-cart/cartUiSlice";
import { motion, AnimatePresence } from "framer-motion";
import "../../../styles/shopping-cart.css";

const Carts = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartProducts = useSelector((s) => s.cart.cartItems);
  const totalAmount = useSelector((s) => s.cart.totalAmount);
  const currentUser = useSelector((s) => s.auth.currentUser);

  const toggleCart = () => dispatch(cartUiActions.toggle());

  const handleCheckout = () => {
    toggleCart();
    if (!currentUser) {
      navigate("/login");
    } else {
      navigate("/checkout");
    }
  };

  return (
    <div className="cart__container" onClick={toggleCart}>
      <motion.div
        className="cart"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cart__header">
          <h5>
            <i className="ri-shopping-basket-line me-2" style={{ color: "var(--primary)" }}></i>
            Your Cart ({cartProducts.length})
          </h5>
          <div className="cart__closeButton" onClick={toggleCart}>
            <span><i className="ri-close-fill"></i></span>
          </div>
        </div>

        <div className="cart__item-list">
          <AnimatePresence>
            {cartProducts.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ textAlign: "center", marginTop: "5rem" }}>
                <i className="ri-shopping-basket-line" style={{ fontSize: "3rem", color: "var(--text-muted)", display: "block", marginBottom: "12px" }}></i>
                <h6 style={{ color: "var(--text-muted)" }}>Your cart is empty</h6>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}>
                  Add items from the menu to get started
                </p>
              </motion.div>
            ) : (
              cartProducts.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CartItem item={item} onClose={toggleCart} />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {cartProducts.length > 0 && (
          <div className="cart__bottom">
            <h6>
              Subtotal: <span>₹{Number(totalAmount).toFixed(2)}</span>
            </h6>
            <button className="cart__checkout-btn" onClick={handleCheckout}>
              {currentUser ? "Proceed to Checkout" : "Sign in to Checkout"}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Carts;
