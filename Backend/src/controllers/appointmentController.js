const Appointment = require("../models/Appointment");

// Book a new appointment
const bookAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, time, notes } = req.body;

    const appointment = await Appointment.create({
      patient,
      doctor,
      date,
      time,
      notes,
    });

    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name phone age")
      .populate("doctor", "name specialization fee");
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};  

// Get one appointment by ID
const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name phone age")
      .populate("doctor", "name specialization fee");

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    res.status(200).json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update appointment status
const updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    res.status(200).json({ message: "Appointment updated", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel/Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    res.status(200).json({ message: "Appointment cancelled" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};