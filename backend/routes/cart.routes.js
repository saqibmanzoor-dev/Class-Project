const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} = require("../controllers/cart.controller");

// All cart routes require customer authentication
router.use(authMiddleware);

router.get("/", getCart);
router.post("/:productId", addToCart);
router.patch("/:productId", updateCartQuantity);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

module.exports = router;
