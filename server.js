require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const path = require("path");

const routineRoutes = require("./routes/routineRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// API Endpoints
app.use("/api", routineRoutes);

// Catch-all route to serve the frontend
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// 1. Start listening IMMEDIATELY so Render health checks pass
app.listen(PORT, () => {
  console.log(`Server is running and listening on port ${PORT}`);
});

// 2. Connect to database
async function initDatabase() {
  const mongoUri = process.env.MONGO_URI;

  try {
    if (mongoUri && !mongoUri.includes("127.0.0.1")) {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log("Connected to MongoDB Atlas successfully!");
    } else {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log("Connected to In-Memory MongoDB!");
    }
  } catch (err) {
    console.error("Database connection warning:", err.message);
    console.log("Falling back to local in-memory DB...");
    try {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log("Connected to fallback In-Memory MongoDB!");
    } catch (fallbackErr) {
      console.error("Critical: Could not start fallback DB:", fallbackErr);
    }
  }
}

initDatabase();