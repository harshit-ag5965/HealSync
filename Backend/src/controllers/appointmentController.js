const Appointment = require("../models/Appointment");
const Patient = require("../models/Patient");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const Bill = require("../models/Bill");
const Doctor = require("../models/Doctor");
const Notification = require("../models/Notification");

// Helper to notify all admins
const notifyAdmins = async (message, type) => {
  const admins = await User.find({ role: "admin" });
  for (const admin of admins) {
    await Notification.create({ user: admin._id, message, type });
  }
};

// Book a new appointment
const bookAppointment = async (req, res) => {
  try {
    const { patient, doctor, date, time, notes } = req.body;

    const appointment = await Appointment.create({
      patient, doctor, date, time, notes,
    });

    const populated = await Appointment.findById(appointment._id)
      .populate("patient", "name")
      .populate("doctor", "name specialization");

    const patientDoc = await Patient.findById(patient);
    const userDoc = await User.findById(patientDoc?.user);
    // console.log("UserDoc:", userDoc); // Debugging line
    // Notify patient
    if (userDoc) {
      await Notification.create({
        user: userDoc._id,
        message: `Your appointment with ${populated.doctor?.name} on ${date} at ${time} has been booked.`,
        type: "booked",
      });
      console.log("Notification sent to patient:", userDoc._id); // Debugging line
    }

    // Notify doctor
    const doctorDoc = await Doctor.findById(doctor);
    if (doctorDoc?.userId) {
      await Notification.create({
        user: doctorDoc.userId,
        message: `New appointment booked by ${populated.patient?.name} on ${date} at ${time}.`,
        type: "booked",
      });
    }
    console.log("Notifications sent to patient and doctor."); // Debugging line

    // Notify admins
    await notifyAdmins(
      `New appointment booked — Patient: ${populated.patient?.name}, Doctor: ${populated.doctor?.name}, Date: ${date}.`,
      "booked"
    );
    console.log("Notifications sent to admins."); // Debugging line

    if (userDoc?.email) {
      await sendEmail({
        to: userDoc.email,
        subject: "✅ Appointment Booked — HMS Hospital",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #1d4ed8; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">🏥 HMS Hospital</h1>
            </div>
            <div style="padding: 24px;">
              <h2 style="color: #1d4ed8;">Appointment Booked!</h2>
              <p style="color: #374151;">Hi <strong>${populated.patient?.name}</strong>,</p>
              <p style="color: #374151;">Your appointment has been booked successfully.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr style="background: #eff6ff;">
                  <td style="padding: 10px; font-weight: bold; color: #1d4ed8;">Doctor</td>
                  <td style="padding: 10px; color: #374151;">${populated.doctor?.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #1d4ed8;">Specialization</td>
                  <td style="padding: 10px; color: #374151;">${populated.doctor?.specialization}</td>
                </tr>
                <tr style="background: #eff6ff;">
                  <td style="padding: 10px; font-weight: bold; color: #1d4ed8;">Date</td>
                  <td style="padding: 10px; color: #374151;">${date}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #1d4ed8;">Time</td>
                  <td style="padding: 10px; color: #374151;">${time}</td>
                </tr>
                ${notes ? `<tr style="background: #eff6ff;"><td style="padding: 10px; font-weight: bold; color: #1d4ed8;">Notes</td><td style="padding: 10px; color: #374151;">${notes}</td></tr>` : ""}
              </table>
              <p style="color: #6b7280; font-size: 13px;">Please arrive 10 minutes early.</p>
              <p style="color: #374151;">Thank you for choosing HMS Hospital! 💙</p>
            </div>
          </div>
        `,
      });
    }
    console.log("last line:", userDoc?.email); // Debugging line

    res.status(201).json({ message: "Appointment booked", appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Get all appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patient", "name phone age")
      .populate("doctor", "name specialization fees");
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
      .populate("doctor", "name specialization fees");

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
    ).populate("patient", "name")
     .populate("doctor", "name specialization");

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    const patientDoc = await Patient.findById(appointment.patient._id);
    const userDoc = await User.findById(patientDoc?.user);
    const doctorDoc = await Doctor.findOne({ _id: appointment.doctor._id });

    // ── CONFIRMED ──
    if (req.body.status === "confirmed") {
      // Notify patient
      if (userDoc) {
        await Notification.create({
          user: userDoc._id,
          message: `Your appointment with ${appointment.doctor?.name} on ${appointment.date} at ${appointment.time} has been confirmed.`,
          type: "confirmed",
        });
      }
      // Notify doctor
      if (doctorDoc?.userId) {
        await Notification.create({
          user: doctorDoc.userId,
          message: `You confirmed the appointment with ${appointment.patient?.name} on ${appointment.date} at ${appointment.time}.`,
          type: "confirmed",
        });
      }
      // Notify admins
      await notifyAdmins(
        `Appointment confirmed — Patient: ${appointment.patient?.name}, Doctor: ${appointment.doctor?.name}, Date: ${appointment.date}.`,
        "confirmed"
      );

      if (userDoc?.email) {
        await sendEmail({
          to: userDoc.email,
          subject: "📅 Appointment Confirmed — HMS Hospital",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #2563eb; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">🏥 HMS Hospital</h1>
              </div>
              <div style="padding: 24px;">
                <h2 style="color: #2563eb;">Your Appointment is Confirmed!</h2>
                <p style="color: #374151;">Hi <strong>${appointment.patient?.name}</strong>,</p>
                <p style="color: #374151;">Your appointment has been confirmed by the doctor.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                  <tr style="background: #eff6ff;">
                    <td style="padding: 10px; font-weight: bold; color: #2563eb;">Doctor</td>
                    <td style="padding: 10px; color: #374151;">${appointment.doctor?.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; color: #2563eb;">Specialization</td>
                    <td style="padding: 10px; color: #374151;">${appointment.doctor?.specialization}</td>
                  </tr>
                  <tr style="background: #eff6ff;">
                    <td style="padding: 10px; font-weight: bold; color: #2563eb;">Date</td>
                    <td style="padding: 10px; color: #374151;">${appointment.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; color: #2563eb;">Time</td>
                    <td style="padding: 10px; color: #374151;">${appointment.time}</td>
                  </tr>
                </table>
                <p style="color: #6b7280; font-size: 13px;">Please arrive 10 minutes early.</p>
                <p style="color: #374151;">See you soon! 💙</p>
              </div>
            </div>
          `,
        });
      }
    }

    // ── CANCELLED ──
    if (req.body.status === "cancelled") {
      // Notify patient
      if (userDoc) {
        await Notification.create({
          user: userDoc._id,
          message: `Your appointment with ${appointment.doctor?.name} on ${appointment.date} has been cancelled.`,
          type: "cancelled",
        });
      }
      // Notify doctor
      if (doctorDoc?.userId) {
        await Notification.create({
          user: doctorDoc.userId,
          message: `Appointment with ${appointment.patient?.name} on ${appointment.date} has been cancelled.`,
          type: "cancelled",
        });
      }
      // Notify admins
      await notifyAdmins(
        `Appointment cancelled — Patient: ${appointment.patient?.name}, Doctor: ${appointment.doctor?.name}, Date: ${appointment.date}.`,
        "cancelled"
      );

      if (userDoc?.email) {
        await sendEmail({
          to: userDoc.email,
          subject: "❌ Appointment Cancelled — HMS Hospital",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #dc2626; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">🏥 HMS Hospital</h1>
              </div>
              <div style="padding: 24px;">
                <h2 style="color: #dc2626;">Appointment Cancelled</h2>
                <p style="color: #374151;">Hi <strong>${appointment.patient?.name}</strong>,</p>
                <p style="color: #374151;">Your appointment has been cancelled.</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                  <tr style="background: #fef2f2;">
                    <td style="padding: 10px; font-weight: bold; color: #dc2626;">Doctor</td>
                    <td style="padding: 10px; color: #374151;">${appointment.doctor?.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; color: #dc2626;">Specialization</td>
                    <td style="padding: 10px; color: #374151;">${appointment.doctor?.specialization}</td>
                  </tr>
                  <tr style="background: #fef2f2;">
                    <td style="padding: 10px; font-weight: bold; color: #dc2626;">Date</td>
                    <td style="padding: 10px; color: #374151;">${appointment.date}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; color: #dc2626;">Time</td>
                    <td style="padding: 10px; color: #374151;">${appointment.time}</td>
                  </tr>
                </table>
                <p style="color: #6b7280; font-size: 13px;">If this was a mistake, please book a new appointment.</p>
                <p style="color: #374151;">We hope to see you again! 💙</p>
              </div>
            </div>
          `,
        });
      }
    }

    // ── COMPLETED ──
    if (req.body.status === "completed") {
      const doctorFeeDoc = await Doctor.findById(appointment.doctor._id);
      const existingBill = await Bill.findOne({ appointment: req.params.id });

      if (!existingBill) {
        await Bill.create({
          appointment: req.params.id,
          patient: appointment.patient._id,
          doctor: appointment.doctor._id,
          amount: doctorFeeDoc?.fees || 0,
          date: appointment.date,
        });

        // Notify patient
        if (userDoc) {
          await Notification.create({
            user: userDoc._id,
            message: `Your appointment with ${appointment.doctor?.name} on ${appointment.date} is completed. Bill of ₹${doctorFeeDoc?.fees || 0} generated.`,
            type: "completed",
          });
        }
        // Notify doctor
        if (doctorDoc?.userId) {
          await Notification.create({
            user: doctorDoc.userId,
            message: `Appointment with ${appointment.patient?.name} on ${appointment.date} marked as completed. Bill of ₹${doctorFeeDoc?.fees || 0} generated.`,
            type: "completed",
          });
        }
        // Notify admins
        await notifyAdmins(
          `Appointment completed — Patient: ${appointment.patient?.name}, Doctor: ${appointment.doctor?.name}, Bill: ₹${doctorFeeDoc?.fees || 0}.`,
          "completed"
        );

        if (userDoc?.email) {
          await sendEmail({
            to: userDoc.email,
            subject: "✅ Appointment Completed — HMS Hospital",
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
                <div style="background-color: #16a34a; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 22px;">🏥 HMS Hospital</h1>
                </div>
                <div style="padding: 24px;">
                  <h2 style="color: #16a34a;">Appointment Completed!</h2>
                  <p style="color: #374151;">Hi <strong>${appointment.patient?.name}</strong>,</p>
                  <p style="color: #374151;">Your appointment is complete. A bill of <strong>₹${doctorFeeDoc?.fees || 0}</strong> has been generated.</p>
                  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <tr style="background: #f0fdf4;">
                      <td style="padding: 10px; font-weight: bold; color: #16a34a;">Doctor</td>
                      <td style="padding: 10px; color: #374151;">${appointment.doctor?.name}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; font-weight: bold; color: #16a34a;">Specialization</td>
                      <td style="padding: 10px; color: #374151;">${appointment.doctor?.specialization}</td>
                    </tr>
                    <tr style="background: #f0fdf4;">
                      <td style="padding: 10px; font-weight: bold; color: #16a34a;">Date</td>
                      <td style="padding: 10px; color: #374151;">${appointment.date}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px; font-weight: bold; color: #16a34a;">Amount Due</td>
                      <td style="padding: 10px; color: #374151; font-weight: bold;">₹${doctorFeeDoc?.fees || 0}</td>
                    </tr>
                  </table>
                  <p style="color: #6b7280; font-size: 13px;">Please check your Bills section to view and pay your invoice.</p>
                  <p style="color: #374151;">Stay healthy! 💚</p>
                </div>
              </div>
            `,
          });
        }
      }
    }

    // ── RESCHEDULED ──
    if (req.body.date || req.body.time) {
      // Notify patient
      if (userDoc) {
        await Notification.create({
          user: userDoc._id,
          message: `Your appointment with ${appointment.doctor?.name} has been rescheduled to ${appointment.date} at ${appointment.time}.`,
          type: "booked",
        });
      }
      // Notify doctor
      if (doctorDoc?.userId) {
        await Notification.create({
          user: doctorDoc.userId,
          message: `Appointment with ${appointment.patient?.name} has been rescheduled to ${appointment.date} at ${appointment.time}.`,
          type: "booked",
        });
      }

      if (userDoc?.email) {
        await sendEmail({
          to: userDoc.email,
          subject: "📅 Appointment Rescheduled — HMS Hospital",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #7c3aed; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 22px;">🏥 HMS Hospital</h1>
              </div>
              <div style="padding: 24px;">
                <h2 style="color: #7c3aed;">Appointment Rescheduled!</h2>
                <p style="color: #374151;">Hi <strong>${appointment.patient?.name}</strong>,</p>
                <p style="color: #374151;">Your appointment has been rescheduled. Here are the new details:</p>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                  <tr style="background: #f5f3ff;">
                    <td style="padding: 10px; font-weight: bold; color: #7c3aed;">Doctor</td>
                    <td style="padding: 10px; color: #374151;">${appointment.doctor?.name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; font-weight: bold; color: #7c3aed;">New Date</td>
                    <td style="padding: 10px; color: #374151;">${appointment.date}</td>
                  </tr>
                  <tr style="background: #f5f3ff;">
                    <td style="padding: 10px; font-weight: bold; color: #7c3aed;">New Time</td>
                    <td style="padding: 10px; color: #374151;">${appointment.time}</td>
                  </tr>
                </table>
                <p style="color: #6b7280; font-size: 13px;">Please arrive 10 minutes early.</p>
                <p style="color: #374151;">Thank you for choosing HMS Hospital! 💙</p>
              </div>
            </div>
          `,
        });
      }
    }

    res.status(200).json({ message: "Appointment updated", appointment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cancel/Delete appointment
const deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("patient", "name")
      .populate("doctor", "name specialization");

    if (!appointment)
      return res.status(404).json({ message: "Appointment not found" });

    const patientDoc = await Patient.findById(appointment.patient._id);
    const userDoc = await User.findById(patientDoc?.user);
    const doctorDoc = await Doctor.findOne({ _id: appointment.doctor._id });

    // Notify patient
    if (userDoc) {
      await Notification.create({
        user: userDoc._id,
        message: `Your appointment with ${appointment.doctor?.name} on ${appointment.date} has been cancelled.`,
        type: "cancelled",
      });
    }
    // Notify doctor
    if (doctorDoc?.userId) {
      await Notification.create({
        user: doctorDoc.userId,
        message: `Appointment with ${appointment.patient?.name} on ${appointment.date} has been cancelled by the patient.`,
        type: "cancelled",
      });
    }
    // Notify admins
    await notifyAdmins(
      `Appointment cancelled — Patient: ${appointment.patient?.name}, Doctor: ${appointment.doctor?.name}, Date: ${appointment.date}.`,
      "cancelled"
    );

    if (userDoc?.email) {
      await sendEmail({
        to: userDoc.email,
        subject: "❌ Appointment Cancelled — HMS Hospital",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #dc2626; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">🏥 HMS Hospital</h1>
            </div>
            <div style="padding: 24px;">
              <h2 style="color: #dc2626;">Appointment Cancelled</h2>
              <p style="color: #374151;">Hi <strong>${appointment.patient?.name}</strong>,</p>
              <p style="color: #374151;">Your appointment has been cancelled.</p>
              <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr style="background: #fef2f2;">
                  <td style="padding: 10px; font-weight: bold; color: #dc2626;">Doctor</td>
                  <td style="padding: 10px; color: #374151;">${appointment.doctor?.name}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #dc2626;">Specialization</td>
                  <td style="padding: 10px; color: #374151;">${appointment.doctor?.specialization}</td>
                </tr>
                <tr style="background: #fef2f2;">
                  <td style="padding: 10px; font-weight: bold; color: #dc2626;">Date</td>
                  <td style="padding: 10px; color: #374151;">${appointment.date}</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #dc2626;">Time</td>
                  <td style="padding: 10px; color: #374151;">${appointment.time}</td>
                </tr>
              </table>
              <p style="color: #6b7280; font-size: 13px;">If this was a mistake, please book a new appointment.</p>
              <p style="color: #374151;">We hope to see you again! 💙</p>
            </div>
          </div>
        `,
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);
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