const express = require("express");
const router = express.Router();
const {
  createPatient,
  getAllPatients,
  getMyPatientProfile,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createPatient);
router.get("/", protect, getAllPatients);
router.get("/me", protect, getMyPatientProfile);  // ✅ MUST be before /:id
router.get("/:id", protect, getPatientById);
router.put("/:id", protect, updatePatient);
router.delete("/:id", protect, deletePatient);

module.exports = router;