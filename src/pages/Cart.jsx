import React from "react";
import CommonSection from "../components/UI/common-section/CommonSection";
import Helmet from "../components/Helmet/Helmet";
import "../styles/cart-page.css";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col } from "reactstrap";
import { cartActions } from "../store/shopping-cart/cartSlice";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Cart = () => {
  const cartItems = useSelector((state) => state.cart.cartItems);
  const totalAmount = useSelector((state) => state.cart.totalAmount);

  return (
    <Helmet title="Cart">
      <CommonSection title="Your Cart" />
      <section className="cart__page-section">
        <Container>
          {cartItems.length === 0 ? (
            <motion.div
              className="cart__empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <i className="ri-shopping-basket-line"></i>
              <h5>Your cart is empty</h5>
              <Link to="/pizzas">
                <button className="addTOCart__btn">Browse Menu</button>
              </Link>
            </motion.div>
          ) : (
            <Row>
              <Col lg="8" className="mb-4">
                <div className="cart__table">
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {cartItems.map((item) => (
                          <CartRow item={item} key={item.id} />
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              </Col>

              <Col lg="4">
                <motion.div
                  className="cart__summary"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <h5 style={{ marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                    Order Summary
                  </h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Subtotal</span>
                    <span style={{ fontWeight: 600 }}>₹{Number(totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Delivery</span>
                    <span style={{ color: "var(--success)", fontWeight: 600 }}>Free</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3" style={{ borderTop: "1px solid var(--border)", paddingTop: 12 }}>
                    <span style={{ fontWeight: 700 }}>Total</span>
                    <span className="cart__subtotal">₹{Number(totalAmount).toFixed(2)}</span>
                  </div>
                  <p>Taxes included. Free delivery on all orders.</p>
                  <div className="cart__page-btn flex-column">
                    <button className="addTOCart__btn mb-3 w-100">
                      <Link to="/checkout">Proceed to Checkout</Link>
                    </button>
                    <button className="addTOCart__btn w-100" style={{ background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                      <Link to="/pizzas" style={{ color: "var(--text-muted)" }}>Continue Shopping</Link>
                    </button>
                  </div>
                </motion.div>
              </Col>
            </Row>
          )}
        </Container>
      </section>
    </Helmet>
  );
};

const CartRow = ({ item }) => {
  const { id, image01, title, price, quantity } = item;
  const dispatch = useDispatch();

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <td className="cart__img-box">
        <img src={image01} alt={title} />
      </td>
      <td>{title}</td>
      <td>₹{price}</td>
      <td>{quantity}</td>
      <td style={{ color: "var(--primary)", fontWeight: 700 }}>
        ₹{(price * quantity).toFixed(2)}
      </td>
      <td className="cart__item-del">
        <i className="ri-delete-bin-line" onClick={() => dispatch(cartActions.deleteItem(id))}></i>
      </td>
    </motion.tr>
  );
};

export default Cart;
