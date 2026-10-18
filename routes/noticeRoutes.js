const express = require("express");
const router = express.Router();
const Notice = require("../models/Notice");
const User = require("../models/User");
// 1. Get all notices
router.get("/", async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    return res.status(200).json(notices);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Post a notice (Superadmin, Admin, Executive)
router.post("/", async (req, res) => {
  try {
    const { actorStudentId, title, content, important } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const actor = await User.findOne({ studentId: actorStudentId });
    if (!actor || !["superadmin", "admin", "executive"].includes(actor.role)) {
      return res.status(403).json({ error: "Unauthorized: Staff access only." });
    }

    const notice = new Notice({
      title: title.trim(),
      content: content.trim(),
      authorName: actor.name || "Transport Desk",
      important: Boolean(important),
    });

    await notice.save();
    return res.status(201).json({ message: "Notice posted successfully!", notice });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Delete a notice (Superadmin, Admin, Executive)
router.delete("/:id", async (req, res) => {
  try {
    const { actorStudentId } = req.body;

    const actor = await User.findOne({ studentId: actorStudentId });
    if (!actor || !["superadmin", "admin", "executive"].includes(actor.role)) {
      return res.status(403).json({ error: "Unauthorized: Staff access only." });
    }

    await Notice.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Notice deleted." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;