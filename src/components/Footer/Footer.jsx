import React from "react";
import { Container } from "reactstrap";
import { Link } from "react-router-dom";
import "../../styles/footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <Container>
        <div className="footer__top">
          <div className="footer__brand">
            <span className="logo-text">Smart Bite</span>
            <p>
              Delivering happiness to your doorstep. Fresh ingredients, bold
              flavors, and lightning-fast delivery — that's the Smart Bite
              promise.
            </p>
            <div className="footer__social">
              {["ri-facebook-fill", "ri-instagram-line", "ri-twitter-x-line", "ri-youtube-fill"].map((icon, i) => (
                <span className="social__link" key={i}>
                  <i className={icon}></i>
                </span>
              ))}
            </div>
          </div>

          <div className="footer__col">
            <h6>Quick Links</h6>
            <ul>
              <li><Link to="/home">Home</Link></li>
              <li><Link to="/pizzas">Menu</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/order-status">Order Status</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h6>Categories</h6>
            <ul>
              <li><Link to="/pizzas">Burgers</Link></li>
              <li><Link to="/pizzas">Pizzas</Link></li>
              <li><Link to="/pizzas">Sushi</Link></li>
              <li><Link to="/pizzas">Desserts</Link></li>
              <li><Link to="/pizzas">Drinks</Link></li>
            </ul>
          </div>

          <div className="footer__col">
            <h6>Delivery Hours</h6>
            <div className="footer__hours-item">
              <span>Mon – Fri</span>
              <p>10:00 AM – 11:00 PM</p>
            </div>
            <div className="footer__hours-item">
              <span>Sat – Sun</span>
              <p>11:00 AM – 12:00 AM</p>
            </div>
            <div className="footer__hours-item">
              <span>Holidays</span>
              <p>12:00 PM – 10:00 PM</p>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p>© 2026 <span>Smart Bite</span>. All rights reserved.</p>
          <p>Made with ❤️ for food lovers</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
