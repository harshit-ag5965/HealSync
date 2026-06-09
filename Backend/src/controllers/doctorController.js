const Doctor = require("../models/Doctor");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// Admin: Add a new doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name, email, password, phone,
      specialization, experience, fees, address
    } = req.body;

    // 1. Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 2. Create user account for doctor
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
      phone: phone || "",
    });

    // 3. Create doctor profile linked to user
    const doctor = await Doctor.create({
      userId: user._id,
      specialization,
      experience,
      fees,
      address: address || "",
    });

    res.status(201).json({
      message: "Doctor added successfully",
      doctor,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all doctors (public)
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isAvailable: true })
      .populate("userId", "name email phone profilePic");

    res.status(200).json({ doctors });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get single doctor by ID (public)
const getDoctorById = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate("userId", "name email phone profilePic");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ doctor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Admin: Delete a doctor
const deleteDoctor = async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Delete both doctor profile and user account
    await User.findByIdAndDelete(doctor.userId);
    await Doctor.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { addDoctor, getAllDoctors, getDoctorById, deleteDoctor };