let bcrypt;
try {
  bcrypt = require("bcrypt");
  if (!bcrypt.hash) throw new Error("bcrypt native not available");
} catch (e) {
  bcrypt = require("bcryptjs");
}

const Customer = require("../models/customer.model");
const { generateToken, cookieOptions } = require("../utils/generateToken");

/**
 * Task 1: Register Customer
 * POST /customers/register
 */
const registerCustomer = async (req, res) => {
  try {
    const { fullName, email, password, phone } = req.body;

    // 1. Mandatory fields validation
    if (!fullName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields (fullName, email, password, phone) are mandatory",
      });
    }

    // Check trimmed values are not empty
    if (
      String(fullName).trim() === "" ||
      String(email).trim() === "" ||
      String(phone).trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Fields cannot be empty or whitespace",
      });
    }

    // 2. Password length validation (at least 6 characters)
    if (String(password).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must contain at least 6 characters",
      });
    }

    // 3. Unique email check
    const normalizedEmail = String(email).toLowerCase().trim();
    const existingCustomer = await Customer.findOne({ email: normalizedEmail });
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    // 4. Hash password with bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 5. Create customer in MongoDB
    const newCustomer = await Customer.create({
      fullName: String(fullName).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: String(phone).trim(),
    });

    // 6. Return success response (excluding password)
    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: {
        _id: newCustomer._id,
        fullName: newCustomer.fullName,
        email: newCustomer.email,
        phone: newCustomer.phone,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    // Handle Mongoose duplicate key error if race condition occurs
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Internal server error during registration",
    });
  }
};

/**
 * Task 2: Login Customer
 * POST /customers/login
 */
const loginCustomer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate request payload
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2. Find customer by email
    const normalizedEmail = String(email).toLowerCase().trim();
    const customer = await Customer.findOne({ email: normalizedEmail });

    // 3. Validate customer & password with bcrypt
    // Do NOT reveal whether email or password was incorrect (security best practice)
    if (!customer) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await bcrypt.compare(password, customer.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 4. Generate JWT
    const token = generateToken(customer._id);

    // 5. Store JWT inside HttpOnly cookie
    res.cookie("token", token, cookieOptions);

    // 6. Return success response with customer info (excluding password)
    return res.status(200).json({
      success: true,
      message: "Login successful",
      customer: {
        _id: customer._id,
        fullName: customer.fullName,
        email: customer.email,
        phone: customer.phone,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

/**
 * Task 3: My Profile
 * GET /customers/me (Protected Route)
 */
const getProfile = async (req, res) => {
  try {
    // req.user is attached by authMiddleware and excludes password
    return res.status(200).json({
      _id: req.user._id,
      fullName: req.user.fullName,
      email: req.user.email,
      phone: req.user.phone,
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error retrieving profile",
    });
  }
};

/**
 * Task 4: Logout Customer
 * POST /customers/logout (Protected Route)
 */
const logoutCustomer = async (req, res) => {
  try {
    // Clear the authentication cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};

/**
 * Bonus Challenge (+10 Marks): Change Password
 * PATCH /customers/change-password (Protected Route)
 */
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    // 1. Validate inputs
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 6 characters",
      });
    }

    // 2. Fetch customer with password
    const customer = await Customer.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // 3. Verify old password
    const isMatch = await bcrypt.compare(oldPassword, customer.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect old password",
      });
    }

    // 4. Hash new password and save
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    customer.password = hashedNewPassword;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while changing password",
    });
  }
};

module.exports = {
  registerCustomer,
  loginCustomer,
  getProfile,
  logoutCustomer,
  changePassword,
};
