const jwt = require("jsonwebtoken");

/**
 * Generate a JSON Web Token for an authenticated customer
 * @param {string} customerId - The MongoDB _id of the customer
 * @returns {string} Signed JWT string
 */
const generateToken = (customerId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is not configured");
  }

  return jwt.sign(
    { id: customerId },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

/**
 * Standard cookie configuration for HttpOnly JWT cookies
 */
const cookieOptions = {
  httpOnly: true, // Prevents client-side scripts from reading the cookie (protects against XSS)
  secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // CSRF protection while supporting local/cross-origin dev
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

module.exports = {
  generateToken,
  cookieOptions,
};
