import React, { useRef, useEffect, useState } from "react";
import { useNavigate, NavLink, Link } from "react-router-dom";
import { Container } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { cartUiActions } from "../../store/shopping-cart/cartUiSlice";
import { authActions } from "../../store/shopping-cart/authSlice";
import "../../styles/header.css";

const nav__links = [
  { display: "Home", path: "/home" },
  { display: "Menu", path: "/pizzas" },
  { display: "Cart", path: "/cart" },
  { display: "Order Status", path: "/order-status" },
  { display: "Contact", path: "/contact" },
];

const Header = () => {
  const menuRef = useRef(null);
  const headerRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const totalQuantity = useSelector((state) => state.cart.totalQuantity);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleMenu = () => menuRef.current.classList.toggle("show__menu");

  const toggleCart = () => dispatch(cartUiActions.toggle());

  const handleLogout = () => {
    dispatch(authActions.logout());
    setDropdownOpen(false);
    navigate("/home");
  };

  useEffect(() => {
    const handleScroll = () => {
      if (document.documentElement.scrollTop > 80) {
        headerRef.current?.classList.add("header__shrink");
      } else {
        headerRef.current?.classList.remove("header__shrink");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest(".user__dropdown")) setDropdownOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  return (
    <header className="header" ref={headerRef}>
      <Container>
        <div className="nav__wrapper d-flex align-items-center justify-content-between">
          <div className="logo" onClick={() => navigate("/home")}>
            <div className="logo__text">
              <span>Smart Bite</span>
              <span>Food Delivery</span>
            </div>
          </div>

          <div className="navigation" ref={menuRef} onClick={toggleMenu}>
            <div
              className="menu d-flex align-items-center gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="header__closeButton">
                <span onClick={toggleMenu}>
                  <i className="ri-close-fill"></i>
                </span>
              </div>
              {nav__links.map((item, index) => (
                <NavLink
                  to={item.path}
                  key={index}
                  className={(navClass) => navClass.isActive ? "active__menu" : ""}
                  onClick={toggleMenu}
                >
                  {item.display}
                </NavLink>
              ))}
              {currentUser?.role === "admin" && (
                <NavLink
                  to="/admin"
                  className={(navClass) => navClass.isActive ? "active__menu" : ""}
                  onClick={toggleMenu}
                  style={{ color: "var(--primary)" }}
                >
                  Admin
                </NavLink>
              )}
            </div>
          </div>

          <div className="nav__right d-flex align-items-center gap-3">
            <span className="cart__icon" onClick={toggleCart}>
              <i className="ri-shopping-basket-line"></i>
              {totalQuantity > 0 && (
                <span className="cart__badge">{totalQuantity}</span>
              )}
            </span>

            {currentUser ? (
              <div className="user__dropdown" style={{ position: "relative" }}>
                <div
                  className="user__avatar"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                {dropdownOpen && (
                  <div className="dropdown__menu-custom">
                    <span style={{ padding: "10px 16px", display: "block", fontSize: "0.8rem", color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}>
                      {currentUser.name}
                    </span>
                    <Link to="/order-status" onClick={() => setDropdownOpen(false)}>
                      My Orders
                    </Link>
                    {currentUser.role === "admin" && (
                      <Link to="/admin" onClick={() => setDropdownOpen(false)}>
                        Admin Panel
                      </Link>
                    )}
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <button className="nav__user-btn" onClick={() => navigate("/login")}>
                Sign In
              </button>
            )}

            <span className="mobile__menu" onClick={toggleMenu}>
              <i className="ri-menu-line"></i>
            </span>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Header;
