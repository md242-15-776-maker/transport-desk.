const mongoose = require("mongoose");

const DayRoutineSchema = new mongoose.Schema(
  {
    first: { type: String, default: null },
    last: { type: String, default: null }
  },
  { _id: false }
);

const StudentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    semesterSystem: { type: String, enum: ["bi", "tri"], required: true },
    station: {
      type: String,
      enum: ["Collegate", "Station Road", "Kamarpara"],
      default: "Collegate"
    },
    routine: {
      Saturday: { type: DayRoutineSchema, default: null },
      Sunday: { type: DayRoutineSchema, default: null },
      Monday: { type: DayRoutineSchema, default: null },
      Tuesday: { type: DayRoutineSchema, default: null },
      Wednesday: { type: DayRoutineSchema, default: null },
      Thursday: { type: DayRoutineSchema, default: null }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Student", StudentSchema);