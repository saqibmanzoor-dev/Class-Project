const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  toggleWishlist,
} = require("../controllers/wishlist.controller");

// All wishlist routes are protected by authentication middleware
router.use(authMiddleware);

// Task 3: GET /wishlist
router.get("/", getWishlist);

// Task 2: POST /wishlist/:productId
router.post("/:productId", addToWishlist);

// Task 4: DELETE /wishlist/:productId
router.delete("/:productId", removeFromWishlist);

// Bonus: PATCH /wishlist/:productId/toggle
router.patch("/:productId/toggle", toggleWishlist);

module.exports = router;
