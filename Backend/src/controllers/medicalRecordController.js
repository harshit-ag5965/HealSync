const MedicalRecord = require("../models/MedicalRecord");
const Patient = require("../models/Patient");
const { cloudinary } = require("../config/cloudinary");

// Patient uploads a record
const uploadRecord = async (req, res) => {
  try {
    const { title, description } = req.body;
    const patientDoc = await Patient.findOne({ user: req.user.id });

    if (!patientDoc)
      return res.status(404).json({ message: "Patient profile not found" });

    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const record = await MedicalRecord.create({
      patient: patientDoc._id,
      title,
      description,
      fileUrl: req.file.path,
      fileType: req.file.mimetype,
      publicId: req.file.filename,
      uploadedBy: req.user.id,
    });

    res.status(201).json({ message: "Record uploaded", record });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patient gets their own records
const getMyRecords = async (req, res) => {
  try {
    const patientDoc = await Patient.findOne({ user: req.user.id });
    if (!patientDoc)
      return res.status(404).json({ message: "Patient not found" });

    const records = await MedicalRecord.find({ patient: patientDoc._id })
      .sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Patient/Admin deletes a record
const deleteRecord = async (req, res) => {
  try {
    const record = await MedicalRecord.findById(req.params.id);
    if (!record)
      return res.status(404).json({ message: "Record not found" });

    // Delete from Cloudinary
    if (record.publicId) {
      await cloudinary.uploader.destroy(record.publicId, { resource_type: "raw" });
    }

    await MedicalRecord.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Record deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin gets all records
const getAllRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find()
      .populate("patient", "name phone")
      .sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Doctor gets records of their patients
const getPatientRecords = async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadRecord,
  getMyRecords,
  deleteRecord,
  getAllRecords,
  getPatientRecords,
};