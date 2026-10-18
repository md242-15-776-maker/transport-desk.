const express = require("express");
const router = express.Router();
const Schedule = require("../models/Schedule");
const User = require("../models/User");

const defaultGlobalData = {
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
            { time: "07:00 AM", note: "", mapUrl: "https://maps.google.com/?q=Tongi+College+Gate" },
            { time: "08:30 AM", note: "[From Station Road]", mapUrl: "https://maps.google.com/?q=Tongi+Station+Road" },
            { time: "10:00 AM", note: "", mapUrl: "https://maps.google.com/?q=Tongi+College+Gate" },
            { time: "12:00 PM", note: "[From Station Road]", mapUrl: "https://maps.google.com/?q=Tongi+Station+Road" }
          ]
        },
        {
          routeTitle: "DSC <> College Gate",
          themeColor: "#16a34a",
          stops: [
            { time: "11:15 AM", note: "[Till Station Road]", mapUrl: "https://maps.google.com/?q=Daffodil+Smart+City+Bus+Terminal" },
            { time: "01:30 PM", note: "", mapUrl: "https://maps.google.com/?q=Daffodil+Smart+City+Bus+Terminal" },
            { time: "04:20 PM", note: "", mapUrl: "https://maps.google.com/?q=Daffodil+Smart+City+Bus+Terminal" },
            { time: "06:10 PM", note: "", mapUrl: "https://maps.google.com/?q=Daffodil+Smart+City+Bus+Terminal" }
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
        },
        {
          routeTitle: "DSC <> College Gate (Friday)",
          themeColor: "#16a34a",
          stops: [
            { time: "02:20 PM", note: "[Through Uttara]", mapUrl: "https://maps.google.com/?q=Daffodil+Smart+City+Bus+Terminal" },
            { time: "06:10 PM", note: "", mapUrl: "https://maps.google.com/?q=Daffodil+Smart+City+Bus+Terminal" }
          ]
        }
      ],
      noticeNote: "University buses are strictly prohibited without a transport card, and all students must wear their ID cards while traveling or getting on the bus."
    }
  ]
};

// 1. Get Schedule
router.get("/", async (req, res) => {
  try {
    let scheduleDoc = await Schedule.findOne();
    if (!scheduleDoc) {
      scheduleDoc = new Schedule(defaultGlobalData);
      await scheduleDoc.save();
    }
    return res.status(200).json(scheduleDoc);
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

    // Flexible fallback unpacking: never reject payload
    let regionsToSave = [];
    if (body.scheduleData && Array.isArray(body.scheduleData.regions)) {
      regionsToSave = body.scheduleData.regions;
    } else if (Array.isArray(body.regions)) {
      regionsToSave = body.regions;
    } else if (body.scheduleData && Array.isArray(body.scheduleData)) {
      regionsToSave = body.scheduleData;
    } else if (body.scheduleData && typeof body.scheduleData === "object") {
      regionsToSave = Object.values(body.scheduleData);
    } else {
      const existing = await Schedule.findOne();
      regionsToSave = existing?.regions || defaultGlobalData.regions;
    }

    let scheduleDoc = await Schedule.findOneAndUpdate(
      {},
      { $set: { regions: regionsToSave } },
      { new: true, upsert: true, runValidators: false }
    );

    return res.status(200).json({ message: "Schedules updated successfully!", schedule: scheduleDoc });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;