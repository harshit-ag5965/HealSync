import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useDarkMode from "../hooks/useDarkMode";
import NotificationBell from "../components/NotificationBell";

const ProfileEditForm = ({ patient, token, onUpdate }) => {
  const [form, setForm] = useState({
    name: patient.name || "",
    phone: patient.phone || "",
    address: patient.address || "",
    medicalHistory: patient.medicalHistory || "",
    age: patient.age || "",
    gender: patient.gender || "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      await axios.put(
        `http://localhost:5000/api/patients/${patient._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg("Profile updated successfully!");
      onUpdate();
    } catch (error) {
      setErr("Failed to update profile");
    }
  };

  

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-3xl">👤</div>
        <div>
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{patient.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Patient</p>
        </div>
      </div>
      {msg && <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-4 py-2 rounded-lg text-sm">✅ {msg}</div>}
      {err && <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-4 py-2 rounded-lg text-sm">❌ {err}</div>}
      {[
        { label: "Full Name", name: "name", type: "text" },
        { label: "Phone", name: "phone", type: "text" },
        { label: "Age", name: "age", type: "number" },
        { label: "Address", name: "address", type: "text" },
        { label: "Medical History", name: "medicalHistory", type: "text" },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
          <input type={field.type} value={form[field.name]}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
        <select value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <button type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
        Save Changes
      </button>
    </form>
  );
};

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bills, setBills] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookingData, setBookingData] = useState({ doctor: "", date: "", time: "", notes: "" });
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });
  const [rescheduleMsg, setRescheduleMsg] = useState("");
  const [recordTitle, setRecordTitle] = useState("");
  const [recordDescription, setRecordDescription] = useState("");
  const [recordFile, setRecordFile] = useState(null);
  const [recordMsg, setRecordMsg] = useState("");
  const [recordErr, setRecordErr] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { darkMode, toggleDarkMode } = useDarkMode();


// eslint-disable-next-line react-hooks/exhaustive-deps
useEffect(() => {
  if (!token) { navigate("/login"); return; }
  fetchData();
}, []);


  const fetchData = async () => {
    try {
      const [patientRes, appointmentsRes, doctorsRes, billsRes, recordsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/patients/me", config),
        axios.get("http://localhost:5000/api/appointments", config),
        axios.get("http://localhost:5000/api/doctors", config),
        axios.get("http://localhost:5000/api/bills", config),
        axios.get("http://localhost:5000/api/medical-records/my", config),
      ]);
      const myPatient = patientRes.data || null;
      setPatient(myPatient);
      const allAppointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
      setAppointments(allAppointments.filter(a =>
        a.patient?._id === myPatient?._id || a.patient === myPatient?._id
      ));
      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
      const allBills = Array.isArray(billsRes.data) ? billsRes.data : [];
      setBills(allBills.filter(b =>
        b.patient?._id === myPatient?._id || b.patient === myPatient?._id
      ));
      setRecords(Array.isArray(recordsRes.data) ? recordsRes.data : []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingMessage(""); setBookingError("");
    try {
      await axios.post("http://localhost:5000/api/appointments", {
        patient: patient._id,
        doctor: bookingData.doctor,
        date: bookingData.date,
        time: bookingData.time,
        notes: bookingData.notes,
      }, config);
      setBookingMessage("Appointment booked successfully!");
      setBookingData({ doctor: "", date: "", time: "", notes: "" });
      fetchData();
    } catch (error) {
      setBookingError(error.response?.data?.message || "Booking failed");
    }
  };

  const handleCancelAppointment = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, config);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMarkPaid = async (billId) => {
    try {
      await axios.put(`http://localhost:5000/api/bills/${billId}/pay`, {}, config);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDownloadPDF = (bill) => {
    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("HMS Hospital", 105, 18, { align: "center" });
    doc.setFontSize(12);
    doc.text("Hospital Management System", 105, 30, { align: "center" });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.text("BILL / INVOICE", 105, 55, { align: "center" });
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(`Bill ID: ${bill._id}`, 20, 70);
    doc.text(`Date: ${bill.date}`, 20, 80);
    doc.text(`Status: ${bill.status.toUpperCase()}`, 20, 90);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 95, 190, 95);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("Patient Details", 20, 108);
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${bill.patient?.name || "N/A"}`, 20, 118);
    doc.text(`Phone: ${bill.patient?.phone || "N/A"}`, 20, 128);
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Doctor Details", 110, 108);
    doc.setFontSize(11);
    doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${bill.doctor?.name || "N/A"}`, 110, 118);
    doc.text(`Specialization: ${bill.doctor?.specialization || "N/A"}`, 110, 128);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 135, 190, 135);
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Amount Details", 20, 148);
    doc.setFillColor(240, 249, 255);
    doc.rect(20, 155, 170, 20, "F");
    doc.setFontSize(13);
    doc.setTextColor(37, 99, 235);
    doc.text("Consultation Fee:", 25, 167);
    doc.setFontSize(16);
    doc.setTextColor(22, 163, 74);
    doc.text(`Rs. ${bill.amount}`, 165, 167, { align: "right" });
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 270, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Thank you for choosing HMS Hospital!", 105, 282, { align: "center" });
    doc.text("For queries: support@hmshospital.com", 105, 290, { align: "center" });
    doc.save(`HMS_Bill_${bill._id}.pdf`);
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setRescheduleMsg("");
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/${reschedulingId}`,
        { date: rescheduleData.date, time: rescheduleData.time },
        config
      );
      setRescheduleMsg("✅ Appointment rescheduled successfully!");
      setTimeout(() => {
        setReschedulingId(null);
        setRescheduleData({ date: "", time: "" });
        setRescheduleMsg("");
      }, 1500);
      fetchData();
    } catch (error) {
      setRescheduleMsg("❌ Failed to reschedule");
    }
  };

  const handleUploadRecord = async (e) => {
    e.preventDefault();
    setRecordMsg(""); setRecordErr("");
    if (!recordFile) { setRecordErr("Please select a file"); return; }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", recordFile);
      formData.append("title", recordTitle);
      formData.append("description", recordDescription);
      await axios.post("http://localhost:5000/api/medical-records/upload", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });
      setRecordMsg("✅ Record uploaded successfully!");
      setRecordTitle("");
      setRecordDescription("");
      setRecordFile(null);
      fetchData();
    } catch (error) {
      setRecordErr("❌ Failed to upload record");
    }
    setUploadLoading(false);
  };

const handleDownloadRecord = async (url, title) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = title || "medical-record";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Download failed:", error);
    window.open(url, "_blank");
  }
};

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/medical-records/${id}`, config);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex items-center justify-center">
      <p className="text-blue-600 dark:text-blue-400 text-xl font-semibold">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

      <nav className="bg-blue-700 dark:bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">🏥 HMS — Patient Portal</h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode}
            className="bg-blue-600 dark:bg-gray-700 border border-blue-500 dark:border-gray-600 px-3 py-1 rounded-lg text-sm hover:bg-blue-500 dark:hover:bg-gray-600 transition">
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <span className="text-sm">Welcome, {patient?.name || "Patient"}!</span>
          <NotificationBell token={token} />
          <button onClick={handleLogout}
            className="bg-white text-blue-700 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-blue-100 transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="bg-white dark:bg-gray-800 shadow-sm px-6 py-2 flex gap-4 flex-wrap">
        {["dashboard", "appointments", "book", "bills", "records", "profile"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}>
            {tab === "book" ? "Book Appointment" : tab === "records" ? "📁 Records" : tab}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-5xl mx-auto">

        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-blue-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Appointments</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{appointments.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-yellow-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Pending</p>
                <p className="text-4xl font-bold text-yellow-500 mt-2">
                  {appointments.filter((a) => a.status === "pending").length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-green-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Completed</p>
                <p className="text-4xl font-bold text-green-500 mt-2">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-red-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Unpaid Bills</p>
                <p className="text-4xl font-bold text-red-500 mt-2">
                  {bills.filter(b => b.status === "unpaid").length}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Appointments</h3>
              {appointments.length === 0 ? (
                <p className="text-gray-400 text-sm">No appointments yet. Book one!</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-600">
                      <th className="pb-2">Doctor</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 5).map((apt) => (
                      <tr key={apt._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-2 text-gray-700 dark:text-gray-300">{apt.doctor?.name || "Doctor"}</td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">{apt.date}</td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">{apt.time}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            apt.status === "pending" ? "bg-yellow-100 text-yellow-600" :
                            apt.status === "confirmed" ? "bg-blue-100 text-blue-600" :
                            apt.status === "completed" ? "bg-green-100 text-green-600" :
                            "bg-red-100 text-red-600"
                          }`}>{apt.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">My Appointments</h2>
            {appointments.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
                <p className="text-gray-400">No appointments found.</p>
                <button onClick={() => setActiveTab("book")}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                  Book Appointment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">{apt.doctor?.name || "Unknown"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{apt.doctor?.specialization}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📅 {apt.date} at ⏰ {apt.time}</p>
                        {apt.notes && <p className="text-sm text-gray-400 mt-1">📝 {apt.notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          apt.status === "pending" ? "bg-yellow-100 text-yellow-600" :
                          apt.status === "confirmed" ? "bg-blue-100 text-blue-600" :
                          apt.status === "completed" ? "bg-green-100 text-green-600" :
                          "bg-red-100 text-red-600"
                        }`}>{apt.status}</span>
                        {apt.status === "pending" && (
                          <div className="flex gap-2">
                            <button onClick={() => { setReschedulingId(apt._id); setRescheduleData({ date: apt.date, time: apt.time }); setRescheduleMsg(""); }}
                              className="bg-purple-100 text-purple-600 text-xs px-3 py-1 rounded-lg hover:bg-purple-200 font-semibold">
                              Reschedule
                            </button>
                            <button onClick={() => handleCancelAppointment(apt._id)}
                              className="bg-red-100 text-red-500 text-xs px-3 py-1 rounded-lg hover:bg-red-200 font-semibold">
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    {reschedulingId === apt._id && (
                      <div className="mt-4 border-t dark:border-gray-600 pt-4 bg-purple-50 dark:bg-purple-900 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-300 mb-3">📅 Reschedule Appointment</h4>
                        {rescheduleMsg && (
                          <div className={`px-4 py-2 rounded-lg text-sm mb-3 ${rescheduleMsg.includes("✅") ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                            {rescheduleMsg}
                          </div>
                        )}
                        <form onSubmit={handleReschedule} className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">New Date</label>
                              <input type="date" value={rescheduleData.date}
                                onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                                min={new Date().toISOString().split("T")[0]} required
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">New Time</label>
                              <select value={rescheduleData.time}
                                onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })}
                                required
                                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                                <option value="">-- Select time --</option>
                                {["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM"].map((t) => (
                                  <option key={t} value={t}>{t}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="submit" className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold">Confirm Reschedule</button>
                            <button type="button" onClick={() => { setReschedulingId(null); setRescheduleMsg(""); }}
                              className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold">Close</button>
                          </div>
                        </form>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "book" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">Book Appointment</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 max-w-lg">
              {bookingMessage && <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-4 py-3 rounded-lg mb-4 text-sm">✅ {bookingMessage}</div>}
              {bookingError && <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">❌ {bookingError}</div>}
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search Doctor</label>
                  <input type="text" placeholder="Search by name..." value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Specialization</label>
                  <select value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">-- All Specializations --</option>
                    {[...new Set(doctors.map(d => d.specialization).filter(Boolean))].map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Doctor</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {doctors.filter(doc =>
                      doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) &&
                      (specializationFilter === "" || doc.specialization === specializationFilter)
                    ).map(doc => (
                      <div key={doc._id}
                        onClick={() => setBookingData({ ...bookingData, doctor: doc._id })}
                        className={`border rounded-xl px-4 py-3 cursor-pointer transition ${
                          bookingData.doctor === doc._id
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900"
                            : "border-gray-200 dark:border-gray-600 hover:border-blue-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        }`}>
                        <p className="font-semibold text-gray-700 dark:text-gray-200 text-sm">{doc.name}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">{doc.specialization}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Experience: {doc.experience} yrs · Fees: ₹{doc.fees}</p>
                      </div>
                    ))}
                    {doctors.filter(doc =>
                      doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) &&
                      (specializationFilter === "" || doc.specialization === specializationFilter)
                    ).length === 0 && (
                      <p className="text-gray-400 text-sm text-center py-4">No doctors found.</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input type="date" value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    required min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <select value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    required className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">-- Select time --</option>
                    {["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
                      "12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (optional)</label>
                  <textarea value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Describe your symptoms..." rows={3}
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <button type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                  Book Appointment
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === "bills" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">My Bills</h2>
            {bills.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
                <p className="text-gray-400">No bills yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bills.map((bill) => (
                  <div key={bill._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-200">{bill.doctor?.name}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">{bill.doctor?.specialization}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📅 {bill.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-2xl font-bold text-blue-600">₹{bill.amount}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bill.status === "paid" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                      }`}>{bill.status}</span>
                      <div className="flex gap-2">
                        {bill.status === "unpaid" && (
                          <button onClick={() => handleMarkPaid(bill._id)}
                            className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600">
                            Mark as Paid
                          </button>
                        )}
                        <button onClick={() => handleDownloadPDF(bill)}
                          className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-600">
                          📄 Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RECORDS TAB ── */}
        {activeTab === "records" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">📁 My Medical Records</h2>

            {/* Upload Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Upload New Record</h3>
              {recordMsg && <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-4 py-2 rounded-lg text-sm mb-3">{recordMsg}</div>}
              {recordErr && <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-4 py-2 rounded-lg text-sm mb-3">{recordErr}</div>}
              <form onSubmit={handleUploadRecord} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                  <input type="text" value={recordTitle}
                    onChange={(e) => setRecordTitle(e.target.value)}
                    placeholder="e.g. Blood Test Report" required
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
                  <input type="text" value={recordDescription}
                    onChange={(e) => setRecordDescription(e.target.value)}
                    placeholder="e.g. Annual checkup results"
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">File (JPG, PNG)</label>
                  <input type="file" accept=".jpg,.jpeg,.png"
                    onChange={(e) => setRecordFile(e.target.files[0])}
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <button type="submit" disabled={uploadLoading}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50">
                  {uploadLoading ? "Uploading..." : "📤 Upload Record"}
                </button>
              </form>
            </div>

            {/* Records List */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">My Records ({records.length})</h3>
              {records.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
                  <p className="text-4xl mb-2">📁</p>
                  <p className="text-gray-400">No records uploaded yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {records.map((record) => (
                    <div key={record._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">📄 {record.title}</p>
                        {record.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{record.description}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          Uploaded: {new Date(record.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <a href={record.fileUrl.replace("/raw/upload/", "/image/upload/").replace(".pdf", ".jpg")}
  target="_blank" rel="noreferrer"
  className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-600">
  👁️ View
</a>
<button
  onClick={() => handleDownloadRecord(record.fileUrl, record.title)}
  className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600">
  ⬇️ Download
</button>
                        <button onClick={() => handleDeleteRecord(record._id)}
                          className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">My Profile</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 max-w-lg">
              {patient ? (
                <ProfileEditForm patient={patient} token={token} onUpdate={fetchData} />
              ) : (
                <p className="text-gray-400 text-center">No patient profile found.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PatientDashboard;