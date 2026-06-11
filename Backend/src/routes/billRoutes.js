const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getAllBills, markAsPaid, getDoctorEarnings } = require("../controllers/billController");

router.get("/", protect, getAllBills);
router.put("/:id/pay", protect, markAsPaid);
router.get("/doctor/earnings", protect, getDoctorEarnings);

module.exports = router;