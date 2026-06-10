const express = require("express");
const router = express.Router();
const {
  addDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);
router.post("/", protect, adminOnly, addDoctor);
router.put("/:id", protect, updateDoctor);
router.delete("/:id", protect, adminOnly, deleteDoctor);

module.exports = router;