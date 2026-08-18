const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (e) {}

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());

app.use(express.json());

// Routes Mount
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
app.use("/api/proposals", require("./routes/proposalRoutes"));
app.use("/api/clients", require("./routes/clientRoutes"));
app.use("/api/freelancers", require("./routes/freelancerRoutes"));
app.use("/api/users", require("./routes/userRoutes"));

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Freelancer Marketplace API Server Active" });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/freelancer_marketplace";

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas successfully!");
    app.listen(PORT, () => {
      console.log(`Freelancer Marketplace API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.warn("MongoDB connection failed:", err.message);
    console.log("Starting Express API Server in standalone mock fallback mode on http://localhost:" + PORT);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT} (Database Offline Mode)`);
    });
  });
