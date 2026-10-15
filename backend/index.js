const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const customerRoutes = require("./routes/customer.routes");
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const orderRoutes = require("./routes/order.routes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/shopkart";

// Cached Mongoose connection promise for Serverless environments (Vercel)
let cachedDbPromise = null;

const connectToDatabase = async () => {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  if (!cachedDbPromise) {
    cachedDbPromise = mongoose.connect(MONGO_URI, {
      bufferCommands: false,
    });
  }

  try {
    await cachedDbPromise;
    return mongoose.connection;
  } catch (err) {
    cachedDbPromise = null;
    throw err;
  }
};

// 1. Core Middlewares
const configuredFrontend = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.replace(/\/$/, "")
  : null;

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  configuredFrontend,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman, curl, or mobile apps)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app") ||
        process.env.NODE_ENV !== "production"
      ) {
        return callback(null, true);
      }

      // Default allow with credentials for flexibility across Vercel deployments
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie", "X-Requested-With"],
    exposedHeaders: ["Set-Cookie"],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Request logger
app.use((req, res, next) => {
  console.log(`📡 [${req.method}] ${req.originalUrl}`);
  next();
});

// Database connection middleware for serverless requests
app.use(async (req, res, next) => {
  if (req.path === "/") {
    return next();
  }
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("❌ Database connection error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// 2. Health check route
app.get("/", async (req, res) => {
  let dbStatus = "disconnected";
  try {
    await connectToDatabase();
    dbStatus = "connected";
  } catch (err) {
    dbStatus = `error: ${err.message}`;
  }

  res.status(200).json({
    success: true,
    message: "ShopKart API is running 🚀",
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
});

// 3. Mount API Routes
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/orders", orderRoutes);

// 4. 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// 5. Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// 6. Connect to MongoDB and Start Server
const startServer = async () => {
  try {
    await connectToDatabase();
    console.log(" Connected to MongoDB successfully");

    const server = app.listen(PORT, () => {
      console.log(` Server running on http://localhost:${PORT}`);
    });

    return server;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

// Start server if run directly
if (require.main === module) {
  startServer();
}

module.exports = app;
module.exports.app = app;
module.exports.startServer = startServer;
