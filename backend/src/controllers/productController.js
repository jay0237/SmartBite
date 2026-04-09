const Product = require("../models/Product");

// GET /api/products
const getProducts = async (req, res) => {
    const { category, search, sort } = req.query;
    let query = {};

    if (category && category !== "All") query.category = category;
    if (search) query.title = { $regex: search, $options: "i" };

    let sortObj = { createdAt: -1 };
    if (sort === "price-asc") sortObj = { price: 1 };
    if (sort === "price-desc") sortObj = { price: -1 };
    if (sort === "name") sortObj = { title: 1 };

    const products = await Product.find(query).sort(sortObj);
    res.json({ success: true, products });
};

// GET /api/products/:id
const getProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
};

// POST /api/products  [admin]
const createProduct = async (req, res) => {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
};

// PUT /api/products/:id  [admin]
const updateProduct = async (req, res) => {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
};

// DELETE /api/products/:id  [admin]
const deleteProduct = async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
