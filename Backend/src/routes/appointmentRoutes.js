const express = require("express");
const router = express.Router();
const {
  bookAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} = require("../controllers/appointmentController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, bookAppointment);
router.get("/", protect, getAllAppointments);
router.get("/:id", protect, getAppointmentById);
router.put("/:id", protect, updateAppointment);
router.delete("/:id", protect, deleteAppointment);

module.exports = router;