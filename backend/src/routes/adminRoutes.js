const router = require("express").Router();
const { getStats, getUsers, deleteUser, updateUserRole, seedRestaurantsData } = require("../controllers/adminController");
const { getAllOrders, updateOrderStatus } = require("../controllers/orderController");
const { getProducts, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");

// All admin routes require auth + admin role
router.use(protect, adminOnly);

router.get("/stats", getStats);
router.get("/users", getUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", updateUserRole);
router.get("/orders", getAllOrders);
router.put("/orders/:id/status", updateOrderStatus);
router.get("/products", getProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/seed-restaurants", seedRestaurantsData);

module.exports = router;
