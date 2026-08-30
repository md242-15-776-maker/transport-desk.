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

async function startServer() {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (mongoUri && !mongoUri.includes("127.0.0.1")) {
      await mongoose.connect(mongoUri);
      console.log("Connected to MongoDB Atlas successfully!");
    } else {
      const { MongoMemoryServer } = require("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log("Connected to In-Memory MongoDB!");
    }

    app.listen(PORT, () => {
      console.log(`Server is live on port ${PORT}`);
    });
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

startServer();