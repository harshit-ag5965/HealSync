const express = require("express");
const router = express.Router();
const {
  uploadRecord,
  getMyRecords,
  deleteRecord,
  getAllRecords,
  getPatientRecords,
} = require("../controllers/medicalRecordController");
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../config/cloudinary");

router.post("/upload", protect, upload.single("file"), uploadRecord);
router.get("/my", protect, getMyRecords);
router.get("/all", protect, getAllRecords);
router.get("/patient/:patientId", protect, getPatientRecords);
router.delete("/:id", protect, deleteRecord);

module.exports = router;