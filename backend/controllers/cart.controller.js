const mongoose = require("mongoose");
const Customer = require("../models/customer.model");
const Product = require("../models/product.model");

/**
 * Get current authenticated user's populated cart
 * GET /cart
 */
const getCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id).populate({
      path: "cart.product",
      select: "name price description category image stock",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Filter out items where product has been deleted from MongoDB
    const validCart = (customer.cart || []).filter((item) => item.product !== null);

    if (validCart.length !== (customer.cart || []).length) {
      customer.cart = validCart;
      await customer.save();
    }

    return res.status(200).json({
      success: true,
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Error fetching cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching cart",
    });
  }
};

/**
 * Add product to cart or increment quantity if already present
 * POST /cart/:productId
 */
const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = Math.max(1, parseInt(req.body.quantity, 10) || 1);

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

    if (!customer.cart) {
      customer.cart = [];
    }

    const existingIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingIndex > -1) {
      const targetQty = customer.cart[existingIndex].quantity + quantity;
      if (targetQty > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock of ${product.stock}`,
        });
      }
      customer.cart[existingIndex].quantity = targetQty;
    } else {
      if (quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Requested quantity exceeds available stock of ${product.stock}`,
        });
      }
      customer.cart.push({ product: productId, quantity });
    }

    await customer.save();
    await customer.populate({
      path: "cart.product",
      select: "name price description category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Cart updated",
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Error adding to cart:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating cart",
    });
  }
};

/**
 * Update quantity of a specific item in cart
 * PATCH /cart/:productId
 */
const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = parseInt(req.body.quantity, 10);

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ObjectId",
      });
    }

    if (isNaN(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be an integer of at least 1",
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock of ${product.stock}`,
      });
    }

    const customer = await Customer.findById(req.user._id);
    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item not present in cart",
      });
    }

    customer.cart[itemIndex].quantity = quantity;
    await customer.save();
    await customer.populate({
      path: "cart.product",
      select: "name price description category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Quantity updated",
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Error updating cart quantity:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while updating cart quantity",
    });
  }
};

/**
 * Remove an item from cart
 * DELETE /cart/:productId
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ObjectId",
      });
    }

    const customer = await Customer.findById(req.user._id);
    const itemIndex = customer.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Item is not present in the user's cart",
      });
    }

    customer.cart.splice(itemIndex, 1);
    await customer.save();
    await customer.populate({
      path: "cart.product",
      select: "name price description category image stock",
    });

    return res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: customer.cart,
    });
  } catch (error) {
    console.error("Error removing from cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while removing from cart",
    });
  }
};

/**
 * Clear the entire cart
 * DELETE /cart
 */
const clearCart = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user._id);
    customer.cart = [];
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart: [],
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while clearing cart",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
};
