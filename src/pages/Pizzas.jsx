import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "reactstrap";
import { motion } from "framer-motion";
import ProductCard from "../components/UI/product-card/ProductCard";
import Helmet from "../components/Helmet/Helmet";
import CommonSection from "../components/UI/common-section/CommonSection";
import ReactPaginate from "react-paginate";
import { getProducts } from "../api/products";
import localProducts from "../assets/fake-data/products";
import "../styles/pagination.css";

const categories = ["All", "Burger", "Pizza", "Sushi", "Drinks", "Snacks", "Desserts"];

const Pizzas = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [pageNumber, setPageNumber] = useState(0);
  const [activeCategory, setCategory] = useState("All");
  const [searchTerm, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setApiError(false);
      try {
        const params = {};
        if (activeCategory !== "All") params.category = activeCategory;
        if (searchTerm.trim()) params.search = searchTerm;
        if (sortBy !== "default") params.sort = sortBy;

        const response = await getProducts(params);
        const products = response?.data?.products;

        if (Array.isArray(products) && products.length > 0) {
          setProducts(products.map((p) => ({ ...p, id: p._id || p.id })));
        } else {
          setProducts(getFilteredLocal(activeCategory, searchTerm, sortBy));
        }
      } catch (err) {
        console.error("API error, using local data:", err.message);
        setApiError(true);
        setProducts(getFilteredLocal(activeCategory, searchTerm, sortBy));
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, searchTerm, sortBy]);

  const productPerPage = 8;
  const visitedPage = pageNumber * productPerPage;
  const displayPage = products.slice(visitedPage, visitedPage + productPerPage);
  const pageCount = Math.ceil(products.length / productPerPage);

  const handleCategoryChange = (cat) => { setCategory(cat); setPageNumber(0); };

  return (
    <Helmet title="Our Menu">
      <CommonSection title="Our Full Menu" />
      <section style={{ padding: "40px 0 80px" }}>
        <Container>

          {/* API error banner */}
          {apiError && (
            <div style={{
              background: "rgba(255,152,0,0.1)", border: "1px solid rgba(255,152,0,0.3)",
              borderRadius: "var(--radius-sm)", padding: "10px 16px", marginBottom: 20,
              color: "#ff9800", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 8,
            }}>
              <i className="ri-wifi-off-line"></i>
              Backend offline — showing cached menu. Start the backend server for live data.
            </div>
          )}

          {/* Search & Sort */}
          <Row className="mb-4">
            <Col lg="6" md="6" className="mb-3">
              <div style={{ position: "relative" }}>
                <i className="ri-search-line" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}></i>
                <input type="text" placeholder="Search for food..." value={searchTerm}
                  onChange={(e) => { setSearch(e.target.value); setPageNumber(0); }}
                  className="input-custom" style={{ paddingLeft: 40 }} />
              </div>
            </Col>
            <Col lg="3" md="3" className="mb-3">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-custom">
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A-Z</option>
              </select>
            </Col>
            <Col lg="3" md="3" className="mb-3 d-flex align-items-center">
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                {products.length} item{products.length !== 1 ? "s" : ""} found
              </span>
            </Col>
          </Row>

          {/* Category Tabs */}
          <div className="d-flex gap-2 flex-wrap mb-5">
            {categories.map((cat) => (
              <motion.button key={cat} whileTap={{ scale: 0.95 }}
                onClick={() => handleCategoryChange(cat)}
                style={{
                  padding: "8px 20px", borderRadius: "50px", border: "1px solid",
                  borderColor: activeCategory === cat ? "var(--primary)" : "var(--border)",
                  background: activeCategory === cat
                    ? "linear-gradient(135deg, var(--primary), var(--primary-dark))"
                    : "transparent",
                  color: activeCategory === cat ? "#fff" : "var(--text-muted)",
                  fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", transition: "all 0.3s",
                }}>
                {cat}
              </motion.button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="text-center py-5">
              <i className="ri-loader-4-line" style={{
                fontSize: "2.5rem", color: "var(--primary)",
                animation: "reg-spin 1s linear infinite", display: "inline-block",
              }}></i>
              <p style={{ color: "var(--text-muted)", marginTop: 12 }}>Loading menu...</p>
            </div>
          ) : (
            <Row>
              {displayPage.length === 0 ? (
                <Col lg="12" className="text-center py-5">
                  <i className="ri-search-line" style={{ fontSize: "3rem", color: "var(--text-muted)", display: "block", marginBottom: 12 }}></i>
                  <h5 style={{ color: "var(--text-muted)" }}>No items found</h5>
                </Col>
              ) : (
                displayPage.map((item, i) => (
                  <Col lg="3" md="4" sm="6" xs="6" key={item.id || item._id} className="mb-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <ProductCard item={item} />
                    </motion.div>
                  </Col>
                ))
              )}
            </Row>
          )}

          {pageCount > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <ReactPaginate
                pageCount={pageCount}
                onPageChange={({ selected }) => setPageNumber(selected)}
                previousLabel={"← Prev"} nextLabel={"Next →"}
                containerClassName="paginationBttns"
                forcePage={pageNumber}
              />
            </div>
          )}
        </Container>
      </section>
    </Helmet>
  );
};

// Filter local products as fallback
function getFilteredLocal(category, search, sort) {
  let list = localProducts.map((p) => ({ ...p, id: p.id || p._id }));
  if (category !== "All") list = list.filter((p) => p.category === category);
  if (search.trim()) list = list.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
  if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (sort === "name") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
  return list;
}

export default Pizzas;
