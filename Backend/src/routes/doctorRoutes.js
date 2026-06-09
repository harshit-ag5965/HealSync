const express = require("express");
const router = express.Router();
const {
  addDoctor,
  getAllDoctors,
  getDoctorById,
  deleteDoctor
} = require("../controllers/doctorController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes (no login needed)
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

// Admin only routes (login + admin role needed)
router.post("/", protect, adminOnly, addDoctor);
router.delete("/:id", protect, adminOnly, deleteDoctor);

module.exports = router;