const jwt = require("jsonwebtoken");
const Customer = require("../models/customer.model");

/**
 * Authentication middleware to protect private customer routes.
 * Reads JWT from cookies (or Authorization header as fallback),
 * verifies the token, finds the customer in MongoDB, and attaches to req.user.
 */
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Read token from HttpOnly cookie (or Bearer header fallback)
    let token = req.cookies ? req.cookies.token : null;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access denied. Token missing.",
      });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "shopkart_super_secret_jwt_key_2026"
      );
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token.",
      });
    }

    // 3. Find customer in MongoDB (exclude password)
    const customer = await Customer.findById(decoded.id).select("-password");

    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Customer not found.",
      });
    }

    // 4. Attach customer object to req.user
    req.user = customer;
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication.",
    });
  }
};

module.exports = authMiddleware;
