const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes"); // ← ADDED
const billRoutes = require("./routes/billRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const startReminderCron = require("./utils/reminderCron");


dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    process.env.FRONTEND_URL,
  ],
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hospital API is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/appointments", appointmentRoutes); // ← ADDED
app.use("/api/bills", billRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/medical-records", medicalRecordRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

startReminderCron();