require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const customerRoutes = require("./routes/customer.routes");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://127.0.0.1:27017/shopkart";

// 1. Core Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 2. Health check route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ShopKart Customer Authentication API is running 🚀",
  });
});

// 3. Mount Customer API Routes
app.use("/customers", customerRoutes);

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
    await mongoose.connect(MONGO_URI);
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

module.exports = { app, startServer };
