const Patient = require("../models/Patient");

// Create a new patient profile
const createPatient = async (req, res) => {
  try {
    const { name, age, gender, phone, address, medicalHistory } = req.body;

    const patient = await Patient.create({
      name,
      age,
      gender,
      phone,
      address,
      medicalHistory,
      user: req.user.id,  // from JWT middleware
    });

    res.status(201).json({ message: "Patient created", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all patients (admin use)
const getAllPatients = async (req, res) => {
  try {
    const patients = await Patient.find().populate("user", "name email");
    res.status(200).json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single patient by ID
const getPatientById = async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id).populate("user", "name email");
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.status(200).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update patient
const updatePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.status(200).json({ message: "Patient updated", patient });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete patient
const deletePatient = async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.status(200).json({ message: "Patient deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};