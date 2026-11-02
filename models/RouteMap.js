const mongoose = require("mongoose");

const RouteMapSchema = new mongoose.Schema(
  {
    routes: { type: Array, default: [] }
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("RouteMap", RouteMapSchema);