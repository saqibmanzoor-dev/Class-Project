const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");
const {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/order.controller");

// All order endpoints are strictly protected by JWT authentication
router.use(authMiddleware);

// Task 4: Create Pending Order + Razorpay Order
router.post("/create-payment-order", createPaymentOrder);

// Task 4 & 5: Verify Payment Signature + Confirm Order + Clear Cart
router.post("/verify-payment", verifyPayment);

// Task 7: Get All Orders for Current User
router.get("/", getMyOrders);

// Single Order API with Ownership Check
router.get("/:id", getOrderById);

// Bonus: Order Status Progression
router.patch("/:id/status", updateOrderStatus);

module.exports = router;
