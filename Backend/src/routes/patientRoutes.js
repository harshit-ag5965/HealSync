const express = require("express");
const router = express.Router();
const {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require("../controllers/patientController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createPatient);         // Create patient
router.get("/", protect, getAllPatients);          // Get all patients
router.get("/:id", protect, getPatientById);      // Get one patient
router.put("/:id", protect, updatePatient);       // Update patient
router.delete("/:id", protect, deletePatient);    // Delete patient

module.exports = router;