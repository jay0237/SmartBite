import React from "react";
import Header from "../Header/Header.jsx";
import Footer from "../Footer/Footer.jsx";
import Routes from "../../routes/Routers";
import Carts from "../UI/cart/Carts.jsx";
import { useSelector } from "react-redux";
import { AnimatePresence } from "framer-motion";

const Layout = () => {
  const showCart = useSelector((state) => state.cartUi.cartIsVisible);

  return (
    <div className="d-flex flex-column" style={{ minHeight: "100vh" }}>
      <Header />
      <AnimatePresence>{showCart && <Carts />}</AnimatePresence>
      <div className="flex-grow-1">
        <Routes />
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
