import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import useDarkMode from "../hooks/useDarkMode";

const DoctorEditForm = ({ doctor, token, onUpdate }) => {
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
      setMsg("Profile updated successfully!");
      onUpdate();
    } catch (error) {
      setErr("Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-3xl">👨‍⚕️</div>
        <div>
          <p className="text-xl font-bold text-gray-700 dark:text-gray-200">{doctor.name}</p>
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">{doctor.specialization}</p>
        </div>
      </div>
      {msg && <div className="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 px-4 py-2 rounded-lg text-sm">✅ {msg}</div>}
      {err && <div className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-4 py-2 rounded-lg text-sm">❌ {err}</div>}
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
          <input
            type={field.type}
            value={form[field.name]}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
      ))}
      <button type="submit"
        className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition">
        Save Changes
      </button>
    </form>
  );
};

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });
  const [rescheduleMsg, setRescheduleMsg] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const decoded = jwtDecode(token);
      const loggedInUserId = decoded.id;

      const [doctorsRes, appointmentsRes, earningsRes, billsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/doctors", config),
        axios.get("http://localhost:5000/api/appointments", config),
        axios.get("http://localhost:5000/api/bills/doctor/earnings", config),
        axios.get("http://localhost:5000/api/bills", config),
      ]);

      const allDoctors = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];
      const myDoctor = allDoctors.find(
        (doc) => doc.userId?._id?.toString() === loggedInUserId
      );
      setDoctor(myDoctor);

      const allAppointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
      const myAppointments = allAppointments.filter(
        (apt) => apt.doctor?._id?.toString() === myDoctor?._id?.toString()
      );
      setAppointments(myAppointments);
      setEarnings(earningsRes.data);

      const allBills = Array.isArray(billsRes.data) ? billsRes.data : [];
      const myBills = allBills.filter(
        (bill) => bill.doctor?._id?.toString() === myDoctor?._id?.toString()
      );
      setBills(myBills);

    } catch (error) {
      console.error("fetchData error:", error);
    }
    setLoading(false);
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

  const handleDownloadPDF = (bill) => {
    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();

    doc.setFillColor(21, 128, 61);
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
    doc.setFillColor(240, 253, 244);
    doc.rect(20, 155, 170, 20, "F");
    doc.setFontSize(13);
    doc.setTextColor(21, 128, 61);
    doc.text("Consultation Fee:", 25, 167);
    doc.setFontSize(16);
    doc.setTextColor(22, 163, 74);
    doc.text(`Rs. ${bill.amount}`, 165, 167, { align: "right" });

    doc.setFillColor(21, 128, 61);
    doc.rect(0, 270, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("Thank you for choosing HMS Hospital!", 105, 282, { align: "center" });
    doc.text("For queries: support@hmshospital.com", 105, 290, { align: "center" });

    doc.save(`HMS_Bill_${bill._id}.pdf`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
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

  const RescheduleForm = () => (
    <div className="mt-4 border-t dark:border-gray-600 pt-4 bg-purple-50 dark:bg-purple-900 rounded-xl p-4">
      <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-300 mb-3">📅 Reschedule Appointment</h4>
      {rescheduleMsg && (
        <div className={`px-4 py-2 rounded-lg text-sm mb-3 ${
          rescheduleMsg.includes("✅") ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
        }`}>
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
              {["09:00 AM","09:30 AM","10:00 AM","10:30 AM",
                "11:00 AM","11:30 AM","12:00 PM","02:00 PM",
                "02:30 PM","03:00 PM","03:30 PM","04:00 PM"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit"
            className="bg-purple-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold">
            Confirm Reschedule
          </button>
          <button type="button"
            onClick={() => { setReschedulingId(null); setRescheduleMsg(""); }}
            className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-200 text-sm px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold">
            Close
          </button>
        </div>
      </form>
    </div>
  );

  if (loading) return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex items-center justify-center">
      <p className="text-blue-600 dark:text-blue-400 text-xl font-semibold">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">

      {/* Navbar */}
      <nav className="bg-green-700 dark:bg-gray-800 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">🏥 HMS — Doctor Portal</h1>
        <div className="flex items-center gap-4">
          <button onClick={toggleDarkMode}
            className="bg-green-600 dark:bg-gray-700 border border-green-500 dark:border-gray-600 px-3 py-1 rounded-lg text-sm hover:bg-green-500 dark:hover:bg-gray-600 transition">
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <span className="text-sm">Welcome, {doctor?.name || "Doctor"}!</span>
          <button onClick={handleLogout}
            className="bg-white text-green-700 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-green-100 transition">
            Logout
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 shadow-sm px-6 py-2 flex gap-4 flex-wrap">
        {["dashboard", "appointments", "patients", "earnings", "bills", "profile"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-5xl mx-auto">

        {/* ── DASHBOARD TAB ── */}
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
                <p className="text-gray-500 dark:text-gray-400 text-sm">Cancelled</p>
                <p className="text-4xl font-bold text-red-500 mt-2">
                  {appointments.filter((a) => a.status === "cancelled").length}
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
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 5).map((apt) => (
                      <tr key={apt._id} className="border-b dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="py-2 text-gray-700 dark:text-gray-300">{apt.patient?.name || "Patient"}</td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">{apt.date}</td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">{apt.time}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-2">
                          {apt.status === "pending" && (
                            <button onClick={() => handleUpdateStatus(apt._id, "confirmed")}
                              className="text-blue-500 text-xs hover:underline mr-2">Confirm</button>
                          )}
                          {apt.status === "confirmed" && (
                            <button onClick={() => handleUpdateStatus(apt._id, "completed")}
                              className="text-green-500 text-xs hover:underline">Complete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* ── APPOINTMENTS TAB ── */}
        {activeTab === "appointments" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">All Appointments</h2>
            {appointments.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
                <p className="text-gray-400">No appointments found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">{apt.patient?.name || "Patient"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">📅 {apt.date} at ⏰ {apt.time}</p>
                        {apt.notes && <p className="text-sm text-gray-400 mt-1">📝 {apt.notes}</p>}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                          {apt.status}
                        </span>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {apt.status === "pending" && (
                            <button onClick={() => handleUpdateStatus(apt._id, "confirmed")}
                              className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-600">
                              Confirm
                            </button>
                          )}
                          {apt.status === "confirmed" && (
                            <button onClick={() => handleUpdateStatus(apt._id, "completed")}
                              className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600">
                              Complete
                            </button>
                          )}
                          {(apt.status === "pending" || apt.status === "confirmed") && (
                            <>
                              <button
                                onClick={() => {
                                  setReschedulingId(apt._id);
                                  setRescheduleData({ date: apt.date, time: apt.time });
                                  setRescheduleMsg("");
                                }}
                                className="bg-purple-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-purple-600">
                                Reschedule
                              </button>
                              <button onClick={() => handleUpdateStatus(apt._id, "cancelled")}
                                className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600">
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {reschedulingId === apt._id && <RescheduleForm />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PATIENTS TAB ── */}
        {activeTab === "patients" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">My Patients</h2>
            {appointments.length === 0 ? (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 text-center">
                <p className="text-gray-400">No patients yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...new Map(appointments.map((a) => [a.patient?._id, a.patient])).values()]
                  .filter(Boolean)
                  .map((patient) => (
                    <div key={patient._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-2xl">👤</div>
                        <div>
                          <p className="font-semibold text-gray-700 dark:text-gray-200">{patient.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{patient.phone}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        <p>Age: {patient.age || "N/A"}</p>
                        <p>Gender: {patient.gender || "N/A"}</p>
                        <p>Medical History: {patient.medicalHistory || "None"}</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* ── EARNINGS TAB ── */}
        {activeTab === "earnings" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">My Earnings</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-green-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Earned</p>
                <p className="text-4xl font-bold text-green-600 mt-2">₹{earnings?.totalEarnings || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-blue-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Total Bills</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{earnings?.totalBills || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-yellow-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Unpaid</p>
                <p className="text-4xl font-bold text-yellow-500 mt-2">{earnings?.unpaidBills || 0}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 border-l-4 border-purple-500">
                <p className="text-gray-500 dark:text-gray-400 text-sm">Paid</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{earnings?.paidBills || 0}</p>
              </div>
            </div>
            {earnings?.monthly?.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Monthly Earnings</h3>
                <div className="space-y-3">
                  {earnings.monthly.map((m) => (
                    <div key={m.month} className="flex justify-between items-center border-b dark:border-gray-600 pb-2">
                      <p className="text-gray-600 dark:text-gray-300 font-medium">{m.month}</p>
                      <p className="text-green-600 font-bold">₹{m.amount}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">All Bills</h3>
              {!earnings?.bills?.length ? (
                <p className="text-gray-400 text-sm">No bills yet.</p>
              ) : (
                <div className="space-y-3">
                  {earnings?.bills?.map((bill) => (
                    <div key={bill._id} className="flex justify-between items-center border-b dark:border-gray-600 pb-3">
                      <div>
                        <p className="font-semibold text-gray-700 dark:text-gray-200">{bill.patient?.name || "Patient"}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">📅 {bill.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-gray-700 dark:text-gray-200">₹{bill.amount}</p>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          bill.status === "paid" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {bill.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BILLS TAB ── */}
        {activeTab === "bills" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">Patient Bills</h2>
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
                      <p className="text-sm text-gray-500 dark:text-gray-400">📅 {bill.date}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-2xl font-bold text-green-600">₹{bill.amount}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bill.status === "paid"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {bill.status}
                      </span>
                      <button onClick={() => handleDownloadPDF(bill)}
                        className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600">
                        📄 Download PDF
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-200 mb-6">My Profile</h2>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 max-w-lg">
              {doctor ? (
                <DoctorEditForm doctor={doctor} token={token} onUpdate={fetchData} />
              ) : (
                <p className="text-gray-400 text-center">No doctor profile found.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default DoctorDashboard;