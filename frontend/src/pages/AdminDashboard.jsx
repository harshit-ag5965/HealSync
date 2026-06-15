import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import useDarkMode from "../hooks/useDarkMode";
import {
  PieChart, Pie, Cell, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";
import NotificationBell from "../components/NotificationBell";

const DoctorEditModal = ({ doctor, token, onUpdate, onClose }) => {
  const [form, setForm] = useState({
    name: doctor.name || "",
    phone: doctor.phone || "",
    address: doctor.address || "",
    specialization: doctor.specialization || "",
    experience: doctor.experience || "",
    fees: doctor.fees || "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      await axios.put(
        `http://localhost:5000/api/doctors/${doctor._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg("Doctor updated successfully!");
      onUpdate();
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      setErr("Failed to update doctor");
    }
  };

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200">Edit Doctor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        {msg && <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-4 py-2 rounded-lg text-sm mb-3">✅ {msg}</div>}
        {err && <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-4 py-2 rounded-lg text-sm mb-3">❌ {err}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label: "Full Name", name: "name", type: "text" },
            { label: "Phone", name: "phone", type: "text" },
            { label: "Specialization", name: "specialization", type: "text" },
            { label: "Experience (years)", name: "experience", type: "number" },
            { label: "Fees (₹)", name: "fees", type: "number" },
            { label: "Address", name: "address", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
              <input type={field.type} value={form[field.name]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
            </div>
          ))}
          <div className="flex gap-3">
            <button type="submit"
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
              Save Changes
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 py-2 rounded-lg font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [allRecords, setAllRecords] = useState([]);
  const [recordSearch, setRecordSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [newDoctor, setNewDoctor] = useState({
    name: "", email: "", password: "", phone: "",
    specialization: "", experience: "", fees: "", address: "",
  });
  const [doctorMsg, setDoctorMsg] = useState("");
  const [doctorErr, setDoctorErr] = useState("");
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });
  const [rescheduleMsg, setRescheduleMsg] = useState("");

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
      const [doctorsRes, patientsRes, appointmentsRes, billsRes, recordsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/doctors", config),
        axios.get("http://localhost:5000/api/patients", config),
        axios.get("http://localhost:5000/api/appointments", config),
        axios.get("http://localhost:5000/api/bills", config),
        axios.get("http://localhost:5000/api/medical-records/all", config),
      ]);
      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
      setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      setBills(Array.isArray(billsRes.data) ? billsRes.data : []);
      setAllRecords(Array.isArray(recordsRes.data) ? recordsRes.data : []);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setDoctorMsg(""); setDoctorErr("");
    try {
      await axios.post("http://localhost:5000/api/doctors", {
        ...newDoctor,
        experience: Number(newDoctor.experience),
        fees: Number(newDoctor.fees),
      }, config);
      setDoctorMsg("Doctor added successfully!");
      setNewDoctor({ name: "", email: "", password: "", phone: "",
        specialization: "", experience: "", fees: "", address: "" });
      fetchData();
    } catch (err) {
      setDoctorErr(err.response?.data?.message || "Failed to add doctor");
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/doctors/${id}`, config);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/patients/${id}`, config);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, { status }, config);
      fetchData();
    } catch (error) {
      console.error(error);
    }
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
      setRescheduleMsg("✅ Rescheduled successfully!");
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

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Delete this medical record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/medical-records/${id}`, config);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const handleDownloadPDF = (bill) => {
    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();
    doc.setFillColor(109, 40, 217);
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
    doc.setFillColor(245, 243, 255);
    doc.rect(20, 155, 170, 20, "F");
    doc.setFontSize(13);
    doc.setTextColor(109, 40, 217);
    doc.text("Consultation Fee:", 25, 167);
    doc.setFontSize(16);
    doc.setTextColor(22, 163, 74);
    doc.text(`Rs. ${bill.amount}`, 165, 167, { align: "right" });
    doc.setFillColor(109, 40, 217);
    doc.rect(0, 270, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Thank you for choosing HMS Hospital!", 105, 282, { align: "center" });
    doc.text("For queries: support@hmshospital.com", 105, 290, { align: "center" });
    doc.save(`HMS_Bill_${bill._id}.pdf`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-600";
      case "confirmed": return "bg-blue-100 text-blue-600";
      case "completed": return "bg-green-100 text-green-600";
      case "cancelled": return "bg-red-100 text-red-600";
      default: return "bg-gray-100 text-gray-600";
    }
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

  const RescheduleForm = () => (
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
  );

  const filteredRecords = allRecords.filter(r =>
    r.patient?.name?.toLowerCase().includes(recordSearch.toLowerCase()) ||
    r.title?.toLowerCase().includes(recordSearch.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      <p className="text-purple-600 dark:text-purple-400 text-xl font-semibold">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

      <nav className="bg-purple-700 dark:bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">🏥 HMS — Admin Panel</h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode}
            className="bg-purple-600 dark:bg-gray-700 border border-purple-500 dark:border-gray-600 px-3 py-1 rounded-lg text-sm hover:bg-purple-500 dark:hover:bg-gray-600 transition">
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <span className="text-sm">Welcome, Admin!</span>
          <NotificationBell token={token} />
          <button onClick={handleLogout}
            className="bg-white text-purple-700 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-purple-100 transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="bg-white dark:bg-gray-800 shadow-sm px-6 py-2 flex gap-4 flex-wrap">
        {["dashboard", "doctors", "patients", "appointments", "bills", "records", "analytics", "add-doctor"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "bg-purple-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}>
            {tab === "add-doctor" ? "Add Doctor" : tab === "analytics" ? "📊 Analytics" : tab === "records" ? "📁 Records" : tab}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-6xl mx-auto">

        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">Hospital Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-purple-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Doctors</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{doctors.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-blue-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Patients</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{patients.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-yellow-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Appointments</p>
                <p className="text-4xl font-bold text-yellow-500 mt-2">{appointments.length}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-green-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Completed</p>
                <p className="text-4xl font-bold text-green-500 mt-2">
                  {appointments.filter(a => a.status === "completed").length}
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Recent Appointments</h3>
              {appointments.length === 0 ? (
                <p className="text-gray-400 text-sm">No appointments yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b dark:border-gray-600">
                      <th className="pb-2">Patient</th>
                      <th className="pb-2">Doctor</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 5).map((apt) => (
                      <tr key={apt._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-2 text-gray-700 dark:text-gray-300">{apt.patient?.name || "N/A"}</td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">{apt.doctor?.name || "N/A"}</td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">{apt.date}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>{apt.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === "doctors" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">All Doctors ({doctors.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div key={doc._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center text-2xl">👨‍⚕️</div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-200">{doc.name}</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">{doc.specialization}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Experience: {doc.experience} yrs</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Fees: ₹{doc.fees}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{doc.address}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setEditingDoctor(doc)}
                      className="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-purple-200">Edit</button>
                    <button onClick={() => handleDeleteDoctor(doc._id)}
                      className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-200">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "patients" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">All Patients ({patients.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patients.map((pat) => (
                <div key={pat._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-2xl">👤</div>
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-200">{pat.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Age: {pat.age} | {pat.gender}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone: {pat.phone}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">History: {pat.medicalHistory}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeletePatient(pat._id)}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-200">Delete</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">All Appointments ({appointments.length})</h2>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-200">{apt.patient?.name || "Patient"}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Doctor: {apt.doctor?.name || "N/A"} — {apt.doctor?.specialization}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📅 {apt.date} at ⏰ {apt.time}</p>
                      {apt.notes && <p className="text-sm text-gray-400 mt-1">📝 {apt.notes}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>{apt.status}</span>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {apt.status === "pending" && (
                          <button onClick={() => handleUpdateStatus(apt._id, "confirmed")}
                            className="bg-blue-100 text-blue-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-200">Confirm</button>
                        )}
                        {apt.status === "confirmed" && (
                          <button onClick={() => handleUpdateStatus(apt._id, "completed")}
                            className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-200">Complete</button>
                        )}
                        {(apt.status === "pending" || apt.status === "confirmed") && (
                          <>
                            <button onClick={() => { setReschedulingId(apt._id); setRescheduleData({ date: apt.date, time: apt.time }); setRescheduleMsg(""); }}
                              className="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-purple-200">Reschedule</button>
                            <button onClick={() => handleUpdateStatus(apt._id, "cancelled")}
                              className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-200">Cancel</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {reschedulingId === apt._id && <RescheduleForm />}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "bills" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">All Bills ({bills.length})</h2>
            {bills.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
                <p className="text-gray-400">No bills yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bills.map((bill) => (
                  <div key={bill._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-200">{bill.patient?.name || "Patient"}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Doctor: {bill.doctor?.name || "N/A"} — {bill.doctor?.specialization}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📅 {bill.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-2xl font-bold text-purple-600">₹{bill.amount}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bill.status === "paid" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
                        {bill.status}
                      </span>
                      <button onClick={() => handleDownloadPDF(bill)}
                        className="bg-purple-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-purple-600">
                        📄 Download PDF
                      </button>
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
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">📁 All Medical Records ({allRecords.length})</h2>

            {/* Search */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 mb-6">
              <input
                type="text"
                placeholder="Search by patient name or record title..."
                value={recordSearch}
                onChange={(e) => setRecordSearch(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>

            {filteredRecords.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
                <p className="text-4xl mb-2">📁</p>
                <p className="text-gray-400">{recordSearch ? "No records found matching your search." : "No medical records uploaded yet."}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRecords.map((record) => (
                  <div key={record._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-700 dark:text-gray-200">📄 {record.title}</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                        Patient: {record.patient?.name || "N/A"}
                      </p>
                      {record.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{record.description}</p>
                      )}
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
        )}

        {activeTab === "analytics" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">📊 Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-purple-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Revenue</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">₹{bills.reduce((sum, b) => sum + (b.amount || 0), 0)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-green-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Paid Bills</p>
                <p className="text-4xl font-bold text-green-600 mt-2">₹{bills.filter(b => b.status === "paid").reduce((sum, b) => sum + (b.amount || 0), 0)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-red-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Unpaid Bills</p>
                <p className="text-4xl font-bold text-red-500 mt-2">₹{bills.filter(b => b.status === "unpaid").reduce((sum, b) => sum + (b.amount || 0), 0)}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-blue-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Appointments</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{appointments.length}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Appointment Status</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={[
                      { name: "Pending", value: appointments.filter(a => a.status === "pending").length },
                      { name: "Confirmed", value: appointments.filter(a => a.status === "confirmed").length },
                      { name: "Completed", value: appointments.filter(a => a.status === "completed").length },
                      { name: "Cancelled", value: appointments.filter(a => a.status === "cancelled").length },
                    ].filter(d => d.value > 0)}
                      cx="50%" cy="50%" outerRadius={90} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}>
                      {["#f59e0b", "#3b82f6", "#22c55e", "#ef4444"].map((color, i) => (
                        <Cell key={i} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Bill Status</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={[
                      { name: "Paid", value: bills.filter(b => b.status === "paid").length },
                      { name: "Unpaid", value: bills.filter(b => b.status === "unpaid").length },
                    ].filter(d => d.value > 0)}
                      cx="50%" cy="50%" outerRadius={90} dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}>
                      <Cell fill="#22c55e" /><Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Appointments per Doctor</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={doctors.map(doc => ({
                    name: doc.name,
                    appointments: appointments.filter(a => a.doctor?._id === doc._id || a.doctor === doc._id).length,
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="appointments" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Revenue per Doctor (₹)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={doctors.map(doc => ({
                    name: doc.name,
                    revenue: bills.filter(b => b.doctor?._id === doc._id || b.doctor === doc._id).reduce((sum, b) => sum + (b.amount || 0), 0),
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Bar dataKey="revenue" fill="#22c55e" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "add-doctor" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">Add New Doctor</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 max-w-lg">
              {doctorMsg && <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-4 py-3 rounded-lg mb-4 text-sm">✅ {doctorMsg}</div>}
              {doctorErr && <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">❌ {doctorErr}</div>}
              <form onSubmit={handleAddDoctor} className="space-y-4">
                {[
                  { label: "Full Name", name: "name", type: "text", placeholder: "Dr. John Smith" },
                  { label: "Email", name: "email", type: "email", placeholder: "doctor@hospital.com" },
                  { label: "Password", name: "password", type: "password", placeholder: "Min 6 characters" },
                  { label: "Phone", name: "phone", type: "text", placeholder: "9999999999" },
                  { label: "Specialization", name: "specialization", type: "text", placeholder: "Cardiologist" },
                  { label: "Experience (years)", name: "experience", type: "number", placeholder: "5" },
                  { label: "Fees (₹)", name: "fees", type: "number", placeholder: "500" },
                  { label: "Address", name: "address", type: "text", placeholder: "Hospital name, City" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{field.label}</label>
                    <input type={field.type} placeholder={field.placeholder} value={newDoctor[field.name]}
                      onChange={(e) => setNewDoctor({ ...newDoctor, [field.name]: e.target.value })}
                      required
                      className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400" />
                  </div>
                ))}
                <button type="submit"
                  className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
                  Add Doctor
                </button>
              </form>
            </div>
          </div>
        )}

      </div>

      {editingDoctor && (
        <DoctorEditModal
          doctor={editingDoctor}
          token={token}
          onUpdate={fetchData}
          onClose={() => setEditingDoctor(null)}
        />
      )}

    </div>
  );
};

export default AdminDashboard;