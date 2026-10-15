const mongoose = require("mongoose");
const Product = require("../models/product.model");

/**
 * Get all products with optional filtering, search, and sorting
 * GET /products
 */
const getProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const filter = {};

    if (category && category !== "All") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (search && search.trim() !== "") {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    let query = Product.find(filter);

    if (sort === "price_asc") {
      query = query.sort({ price: 1 });
    } else if (sort === "price_desc") {
      query = query.sort({ price: -1 });
    } else if (sort === "newest") {
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query;

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

/**
 * Get single product by ObjectId
 * GET /products/:id
 */
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ObjectId",
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching product",
    });
  }
};

/**
 * Create a new product (catalog management)
 * POST /products
 */
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    // 1. Check all required fields
    if (
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !image
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields (name, description, price, category, image) are required",
      });
    }

    // 2. Validate price > 0
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid price: Price must be greater than 0",
      });
    }

    // 3. Validate stock >= 0
    const numStock = stock !== undefined ? Number(stock) : 0;
    if (isNaN(numStock) || numStock < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock: Stock cannot be negative",
      });
    }

    const product = new Product({
      name: String(name).trim(),
      description: String(description).trim(),
      price: numPrice,
      category: String(category).trim(),
      image: String(image).trim(),
      stock: numStock,
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while creating product",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
};
