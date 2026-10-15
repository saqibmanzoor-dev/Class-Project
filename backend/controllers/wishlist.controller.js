const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

/**
 * Task 2: Add Product to Wishlist
 * POST /wishlist/:productId (Protected)
 */
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ObjectId",
      });
    }

    // 2. Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 3. Find authenticated customer
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    // 4. Duplicate prevention (409 Conflict)
    const isAlreadyWishlisted = customer.wishlist.some(
      (id) => id.toString() === productId
    );

    if (isAlreadyWishlisted) {
      return res.status(409).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    // 5. Add product ObjectId and save
    customer.wishlist.push(productId);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error("Add to Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while adding to wishlist",
    });
  }
};

/**
 * Task 3: Get Current User's Wishlist
 * GET /wishlist (Protected)
 */
const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price category image stock description",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Filter out deleted products if any
    const validWishlist = (customer.wishlist || []).filter((item) => item !== null);
    if (validWishlist.length !== (customer.wishlist || []).length) {
      customer.wishlist = validWishlist.map((item) => item._id);
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      count: validWishlist.length,
      wishlist: validWishlist,
    });
  } catch (error) {
    console.error("Get Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching wishlist",
    });
  }
};

/**
 * Task 4: Remove Product from Wishlist
 * DELETE /wishlist/:productId (Protected)
 */
const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // 1. Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ObjectId",
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!customer.wishlist || customer.wishlist.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    const itemIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not in wishlist",
      });
    }

    // 2. Remove ObjectId from array and save
    customer.wishlist.splice(itemIndex, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while removing from wishlist",
    });
  }
};

/**
 * Bonus Challenge (+10 Marks): Toggle Wishlist Action
 * PATCH /wishlist/:productId/toggle (Protected)
 */
const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ObjectId",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!customer.wishlist) {
      customer.wishlist = [];
    }

    const existingIndex = customer.wishlist.findIndex(
      (id) => id.toString() === productId
    );

    if (existingIndex > -1) {
      customer.wishlist.splice(existingIndex, 1);
      await customer.save();
      return res.status(200).json({
        success: true,
        saved: false,
        message: "Product removed from wishlist",
      });
    } else {
      customer.wishlist.push(productId);
      await customer.save();
      return res.status(200).json({
        success: true,
        saved: true,
        message: "Product added to wishlist",
      });
    }
  } catch (error) {
    console.error("Toggle Wishlist Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while toggling wishlist",
    });
  }
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
};
