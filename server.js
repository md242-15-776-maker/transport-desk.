require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");

const routineRoutes = require("./routes/routineRoutes");
const authRoutes = require("./routes/authRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API Endpoints
app.use("/api", routineRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/schedule", scheduleRoutes);

// Lightweight health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Explicit 404 handler for API calls
app.all("/api/{*path}", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Catch-all route to serve the frontend SPA
app.get("/{*path}", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Self-Healing Database Initialization
async function initDatabase() {
  const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/transport-desk";

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 4000,
    });
    console.log("Connected to MongoDB successfully!");
  } catch (err) {
    console.log("Local/Cloud DB not available. Automatically starting In-Memory MongoDB for local development...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log("Connected to fallback In-Memory MongoDB successfully!");
    } catch (fallbackErr) {
      console.error("Critical: Could not start fallback database:", fallbackErr);
      process.exit(1);
    }
  }
}

// Initialize DB and start listening
initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
  });
});