const express = require("express");
const router = express.Router();
const Student = require("../models/Student");
const { calculateDemand } = require("../utils/matcher");

router.post("/routine", async (req, res) => {
  try {
    const { studentId, name, semesterSystem, station, routine } = req.body;
    if (!studentId || !name || !semesterSystem) {
      return res.status(400).json({ error: "Please fill in all required fields." });
    }

    const updatedStudent = await Student.findOneAndUpdate(
      { studentId },
      { name, semesterSystem, station: station || "Collegate", routine },
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(200).json({ message: "Routine successfully recorded!", student: updatedStudent });
  } catch (err) {
    return res.status(500).json({ error: "Server error: " + err.message });
  }
});

router.get("/demand", async (req, res) => {
  try {
    const { day = "Saturday", filter = "both" } = req.query;
    const students = await Student.find({}, { studentId: 1, name: 1, semesterSystem: 1, station: 1, routine: 1 }).lean();
    const demand = calculateDemand(students, day, filter);
    return res.status(200).json(demand);
  } catch (err) {
    return res.status(500).json({ error: "Aggregation error: " + err.message });
  }
});

module.exports = router;