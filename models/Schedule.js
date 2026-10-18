const mongoose = require("mongoose");

const GlobalScheduleSchema = new mongoose.Schema(
  {
    regions: { type: Array, default: [] }
  },
  { timestamps: true, strict: false }
);

module.exports = mongoose.model("Schedule", GlobalScheduleSchema);