import React from "react";
import { useNavigate } from "react-router-dom";
import "../../../styles/cart-item.css";
import { useDispatch } from "react-redux";
import { cartActions } from "../../../store/shopping-cart/cartSlice";

const CartItem = ({ item, onClose }) => {
  const { id, title, price, image01, quantity, extraIngredients } = item;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const incrementItem = (e) => {
    e.stopPropagation();
    dispatch(cartActions.addItem({ id, title, price, image01, extraIngredients }));
  };

  const decreaseItem = (e) => {
    e.stopPropagation();
    dispatch(cartActions.removeItem(id));
  };

  const deleteItem = (e) => {
    e.stopPropagation();
    dispatch(cartActions.deleteItem(id));
  };

  const handleClick = () => {
    navigate(`/pizzas/${id}`);
    onClose();
  };

  return (
    <div className="cart__item" onClick={handleClick}>
      <div className="cart__item-info d-flex gap-3">
        <img src={image01} alt={title} />
        <div className="cart__product-info w-100 d-flex justify-content-between">
          <div className="flex-grow-1">
            <h6 className="cart__product-title">{title}</h6>
            <p className="cart__product-price">
              {quantity}x <span>₹{price}</span>
            </p>
            {extraIngredients && extraIngredients.length > 0 && (
              <div className="mb-1">
                {extraIngredients.map((v) => (
                  <span key={v} className="extra__tag">{v}</span>
                ))}
              </div>
            )}
            <div className="increase__decrease-btn" onClick={(e) => e.stopPropagation()}>
              <span className="increase__btn" onClick={incrementItem}>
                <i className="ri-add-line"></i>
              </span>
              <span className="quantity">{quantity}</span>
              <span className="decrease__btn" onClick={decreaseItem}>
                <i className="ri-subtract-line"></i>
              </span>
            </div>
          </div>
          <span className="delete__btn" onClick={deleteItem}>
            <i className="ri-close-line"></i>
          </span>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
