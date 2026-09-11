const express = require("express");
const router = express.Router();
const User = require("../models/User");

// 1. Save or register profile
router.post("/profile", async (req, res) => {
  try {
    const { studentId, name } = req.body;
    if (!studentId || !name) {
      return res.status(400).json({ error: "Student ID and Name are required." });
    }

    const cleanId = studentId.trim();
    const cleanName = name.trim();

    // ID 096 is strictly the sole Superadmin
    const isSuperAdminId = cleanId === "096";

    let user = await User.findOne({ studentId: cleanId });

    if (!user) {
      user = new User({
        studentId: cleanId,
        name: cleanName,
        role: isSuperAdminId ? "superadmin" : "student",
        isPermanentSuperAdmin: isSuperAdminId,
      });
      await user.save();
      return res.status(201).json({ message: "Profile created!", user });
    }

    user.name = cleanName;
    if (isSuperAdminId) {
      user.role = "superadmin";
      user.isPermanentSuperAdmin = true;
    }
    await user.save();
    return res.status(200).json({ message: "Profile updated!", user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Assign / Promote roles (Admins and Superadmin only)
router.post("/assign-role", async (req, res) => {
  try {
    const { actorStudentId, targetStudentId, targetName, targetRole } = req.body;

    if (!["admin", "executive"].includes(targetRole)) {
      return res.status(400).json({ error: "Allowed roles are 'admin' or 'executive'." });
    }

    const actor = await User.findOne({ studentId: actorStudentId });
    if (!actor) return res.status(403).json({ error: "Actor profile not found." });

    if (actor.role === "executive" || actor.role === "student") {
      return res.status(403).json({ error: "Unauthorized: Only Admins can assign roles." });
    }

    let target = await User.findOne({ studentId: targetStudentId.trim() });
    if (!target) {
      target = new User({
        studentId: targetStudentId.trim(),
        name: targetName?.trim() || "New Member",
        role: targetRole,
      });
    } else {
      if (target.isPermanentSuperAdmin || target.role === "superadmin") {
        return res.status(403).json({ error: "Cannot modify the Superadmin." });
      }
      target.role = targetRole;
      if (targetName) target.name = targetName.trim();
    }

    await target.save();
    return res.status(200).json({ message: `${target.name} is now ${targetRole}.`, user: target });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Remove a user
router.delete("/remove-user", async (req, res) => {
  try {
    const { actorStudentId, targetStudentId } = req.body;

    const actor = await User.findOne({ studentId: actorStudentId });
    const target = await User.findOne({ studentId: targetStudentId });

    if (!actor || !target) {
      return res.status(404).json({ error: "Actor or target not found." });
    }

    if (target.isPermanentSuperAdmin || target.role === "superadmin") {
      return res.status(403).json({ error: "Superadmin cannot be removed!" });
    }

    if (actor.role === "executive" || actor.role === "student") {
      return res.status(403).json({ error: "Unauthorized: Only Admins can remove members." });
    }

    await User.deleteOne({ studentId: targetStudentId });
    return res.status(200).json({ message: `User ${target.name} removed successfully.` });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Get only appointed staff members (Admin & Executive)
router.get("/users", async (req, res) => {
  try {
    const users = await User.find(
      { role: { $in: ["admin", "executive"] } },
      "studentId name role isPermanentSuperAdmin createdAt"
    ).sort({ createdAt: 1 });
    return res.status(200).json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;