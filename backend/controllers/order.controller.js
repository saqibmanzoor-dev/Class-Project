const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Customer = require("../models/customer.model");
const { getRazorpayInstance } = require("../config/razorpay");

/**
 * Task 4: Create Pending ShopKart Order & Razorpay Order
 * POST /orders/create-payment-order
 * 
 * Strict Business Rules:
 * 1. Authenticate user
 * 2. Validate shipping address fields (no empty, valid phone format, 6-digit pincode)
 * 3. Re-verify user cart (reject if empty)
 * 4. Load fresh Product documents from database
 * 5. Verify live stock for each cart item
 * 6. Calculate totalAmount exclusively on the server (ignore any frontend total)
 * 7. Snapshot name, price, quantity, image
 * 8. Create pending ShopKart order (PENDING_PAYMENT)
 * 9. Create Razorpay Order in paise (amount * 100)
 * 10. Keep cart untouched until payment verification
 */
const createPaymentOrder = async (req, res) => {
  try {
    let { shippingAddress } = req.body;

    // 1. Validate Shipping Address
    if (!shippingAddress || typeof shippingAddress !== "object") {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required",
      });
    }

    if (shippingAddress.shippingAddress && typeof shippingAddress.shippingAddress === "object") {
      shippingAddress = shippingAddress.shippingAddress;
    }

    const { fullName, phone, addressLine1, city, state, pincode } = shippingAddress;

    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !addressLine1?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All shipping address fields are mandatory and cannot be empty",
      });
    }

    // Phone validation: Indian standard / 10-14 digits
    const cleanedPhone = phone.replace(/[\s-]/g, "");
    if (!/^\+?[0-9]{10,14}$/.test(cleanedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid phone number (10 digits minimum)",
      });
    }

    // Pincode validation: 6-digit postal code
    if (!/^\d{6}$/.test(pincode.trim())) {
      return res.status(400).json({
        success: false,
        message: "Pincode must contain exactly 6 digits",
      });
    }

    // 2. Load User's Cart
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    if (!customer.cart || customer.cart.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Your cart is empty. Please add products before checking out.",
      });
    }

    // 3. Load Latest Product Data & Re-verify Stock
    const snapshotItems = [];
    let serverCalculatedTotal = 0;

    for (const item of customer.cart) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(400).json({
          success: false,
          message: "One or more products in your cart are no longer available in the catalog.",
        });
      }

      // Live stock check
      if (item.quantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`,
        });
      }

      // Build purchase-time snapshot
      snapshotItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image || "",
      });

      serverCalculatedTotal += product.price * item.quantity;
    }

    if (serverCalculatedTotal <= 0) {
      return res.status(400).json({
        success: false,
        message: "Calculated order total must be greater than zero",
      });
    }

    // 4. Create Pending ShopKart Order Document
    const shopKartOrder = new Order({
      user: req.user._id,
      items: snapshotItems,
      shippingAddress: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine1: addressLine1.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
      },
      totalAmount: serverCalculatedTotal,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    // 5. Create Razorpay Order in smallest currency unit (paise)
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: "Razorpay payment gateway is not properly configured",
      });
    }

    const amountInPaise = Math.round(serverCalculatedTotal * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: shopKartOrder._id.toString(),
      notes: {
        customerId: req.user._id.toString(),
        customerEmail: req.user.email,
      },
    });

    shopKartOrder.razorpayOrderId = rzpOrder.id;
    await shopKartOrder.save();

    // 6. Return safe checkout information (Key Secret is NEVER exposed to frontend)
    return res.status(201).json({
      success: true,
      shopKartOrderId: shopKartOrder._id,
      razorpayOrderId: rzpOrder.id,
      amount: amountInPaise,
      currency: "INR",
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Error creating payment order:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while creating order",
    });
  }
};

/**
 * Task 4 & 5: Verify Razorpay Payment Signature and Confirm Order
 * POST /orders/verify-payment
 * 
 * Strict Verification:
 * 1. Find ShopKart order and confirm ownership
 * 2. Verify HMAC SHA256 signature using database-stored Razorpay Order ID and Secret
 * 3. On failure: Mark payment FAILED, preserve user cart
 * 4. On success: Mark PAID, status PLACED, decrement inventory, clear cart
 */
const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!shopKartOrderId || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment verification parameters (shopKartOrderId, razorpay_payment_id, razorpay_signature)",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ShopKart order ObjectId",
      });
    }

    const order = await Order.findById(shopKartOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ownership check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot access or verify another user's order",
      });
    }

    // HMAC SHA256 Signature Verification
    // Expected format: order_id + "|" + payment_id
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const body = order.razorpayOrderId + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      order.paymentStatus = "FAILED";
      await order.save();

      return res.status(400).json({
        success: false,
        message: "Invalid payment signature. Payment verification failed.",
      });
    }

    // Signature verified successfully -> Mark PAID & PLACED
    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // Deduct stock from each product in the catalog
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // Task 5: Clear user cart ONLY after successful payment verification
    await Customer.findByIdAndUpdate(req.user._id, {
      $set: { cart: [] },
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully. Order confirmed!",
      order,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while verifying payment",
    });
  }
};

/**
 * Task 7: Get All Orders for Current Authenticated User
 * GET /orders
 * 
 * Rules:
 * - Return only orders belonging to req.user._id
 * - Sorted newest first (createdAt: -1)
 */
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

/**
 * Single Order API
 * GET /orders/:id
 * 
 * Rules:
 * - User must be authenticated
 * - Order must exist
 * - User must own the order (prevents ID enumeration attacks)
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ObjectId",
      });
    }

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ownership verification
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to view this order",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};

/**
 * Bonus Challenge (+10 Marks):
 * Order Status Progression (PLACED -> CONFIRMED -> SHIPPED -> DELIVERED)
 * PATCH /orders/:id/status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Ownership check or admin check
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You cannot modify this order",
      });
    }

    order.status = status;
    await order.save();

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating order status",
    });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
};
