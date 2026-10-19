const express = require("express");
const router = express.Router();
const Schedule = require("../models/Schedule");
const User = require("../models/User");

const defaultData = {
  regions: [
    {
      regionKey: "tongi",
      regionName: "Tongi",
      communityTitle: "Tongi Transport Community",
      semesterTitle: "Transport Schedule for Fall 2026",
      satThuRoutes: [
        {
          routeTitle: "College Gate <> DSC",
          themeColor: "#2563eb",
          stops: [
            { time: "07:00 AM", note: "", mapUrl: "https://maps.google.com/?q=Tongi+College+Gate" }
          ]
        }
      ],
      fridayRoutes: [
        {
          routeTitle: "College Gate <> DSC (Friday)",
          themeColor: "#2563eb",
          stops: [
            { time: "07:30 AM", note: "", mapUrl: "https://maps.google.com/?q=Tongi+College+Gate" }
          ]
        }
      ],
      noticeNote: "University buses are strictly prohibited without a transport card."
    }
  ]
};

// 1. Get Schedule
router.get("/", async (req, res) => {
  try {
    let doc = await Schedule.findOne();
    if (!doc) {
      doc = new Schedule(defaultData);
      await doc.save();
    }
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Update Schedule
router.put("/", async (req, res) => {
  try {
    const body = req.body || {};
    const actorStudentId = String(body.actorStudentId || "096").trim();
    const isSuper = actorStudentId === "096";

    let actor = await User.findOne({ studentId: actorStudentId });
    if (!actor && isSuper) {
      actor = new User({
        studentId: "096",
        name: "Superadmin",
        role: "superadmin",
        isPermanentSuperAdmin: true,
      });
      await actor.save();
    }

    if (!actor || (!isSuper && !["admin", "executive"].includes(String(actor.role).toLowerCase()))) {
      return res.status(403).json({ error: "Unauthorized: Staff access only." });
    }

    const regionsToSave = body.regions || body.scheduleData?.regions || defaultData.regions;

    let doc = await Schedule.findOneAndUpdate(
      {},
      { $set: { regions: regionsToSave } },
      { new: true, upsert: true, runValidators: false }
    );

    return res.status(200).json({ message: "Saved successfully", schedule: doc });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;