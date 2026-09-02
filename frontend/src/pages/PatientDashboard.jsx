import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useDarkMode from "../hooks/useDarkMode";
import NotificationBell from "../components/NotificationBell";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import Logo from "../components/Logo";
import BASE_URL from "../api";

const ProfileEditForm = ({ patient, token, onUpdate, darkMode }) => {
  const [form, setForm] = useState({
    name: patient?.name || "",
    phone: patient?.phone || "",
    address: patient?.address || "",
    medicalHistory: patient?.medicalHistory || "",
    age: patient?.age || "",
    gender: patient?.gender || "",
  });
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      await axios.put(
        `${BASE_URL}/api/patients/${patient._id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg("✅ Profile updated successfully!");
      toast.success("Profile updated!");
      onUpdate();
    } catch (error) {
      setErr("❌ Failed to update profile");
      toast.error("Failed to update profile");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {msg && <div className="bg-green-100 text-green-600 px-4 py-2 rounded-xl text-sm">{msg}</div>}
      {err && <div className="bg-red-100 text-red-600 px-4 py-2 rounded-xl text-sm">{err}</div>}
      {[
        { label: "Full Name", name: "name", type: "text" },
        { label: "Phone", name: "phone", type: "text" },
        { label: "Age", name: "age", type: "number" },
        { label: "Address", name: "address", type: "text" },
        { label: "Medical History", name: "medicalHistory", type: "text" },
      ].map((field) => (
        <div key={field.name}>
          <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
            {field.label}
          </label>
          <input
            type={field.type}
            value={form[field.name]}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
            className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
              darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 bg-gray-50"
            }`}
          />
        </div>
      ))}
      <div>
        <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
          Gender
        </label>
        <select
          value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
            darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 bg-gray-50"
          }`}>
          <option value="">Select Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>
      <button type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
        Save Changes →
      </button>
    </form>
  );
};

const PatientDashboard = () => {
  const [patient, setPatient] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [bookingData, setBookingData] = useState({ doctor: "", date: "", time: "", notes: "" });
  const [doctorSearch, setDoctorSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });
  const [rescheduleMsg, setRescheduleMsg] = useState("");

  const [searchAppointments, setSearchAppointments] = useState("");
  const [aptPage, setAptPage] = useState(1);
  const [searchBills, setSearchBills] = useState("");
  const [billPage, setBillPage] = useState(1);
  const PER_PAGE = 5;

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { darkMode, toggleDarkMode } = useDarkMode();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchData();
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const fetchData = async () => {
    try {
      const [patientRes, appointmentsRes, doctorsRes, billsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/patients/me`, config),
        axios.get(`${BASE_URL}/api/appointments`, config),
        axios.get(`${BASE_URL}/api/doctors`, config),
        axios.get(`${BASE_URL}/api/bills`, config),
      ]);
      setPatient(patientRes.data || null);
      // Backend already filters appointments & bills by patient role
      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
      setBills(Array.isArray(billsRes.data) ? billsRes.data : []);
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const filteredAppointments = appointments.filter(a =>
    a.doctor?.name?.toLowerCase().includes(searchAppointments.toLowerCase()) ||
    a.status?.toLowerCase().includes(searchAppointments.toLowerCase()) ||
    a.date?.includes(searchAppointments)
  );
  const filteredBills = bills.filter(b =>
    b.doctor?.name?.toLowerCase().includes(searchBills.toLowerCase()) ||
    b.status?.toLowerCase().includes(searchBills.toLowerCase())
  );

  const paginate = (arr, page) => arr.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = (arr) => Math.ceil(arr.length / PER_PAGE);

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("role"); navigate("/login"); };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${BASE_URL}/api/appointments`, {
        patient: patient._id, doctor: bookingData.doctor,
        date: bookingData.date, time: bookingData.time, notes: bookingData.notes,
      }, config);
      toast.success("Appointment booked successfully!");
      setBookingData({ doctor: "", date: "", time: "", notes: "" });
      fetchData();
    } catch (error) { toast.error(error.response?.data?.message || "Booking failed"); }
  };

  const handleCancelAppointment = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/appointments/${id}`, config);
      toast.success("Appointment cancelled");
      fetchData();
    } catch { toast.error("Failed to cancel"); }
  };

  const handleMarkPaid = async (billId) => {
    try {
      await axios.put(`${BASE_URL}/api/bills/${billId}/pay`, {}, config);
      toast.success("Bill marked as paid!");
      fetchData();
    } catch { toast.error("Failed to update bill"); }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setRescheduleMsg("");
    try {
      await axios.put(`${BASE_URL}/api/appointments/${reschedulingId}`,
        { date: rescheduleData.date, time: rescheduleData.time }, config);
      toast.success("Rescheduled successfully!");
      setRescheduleMsg("✅ Rescheduled successfully!");
      setTimeout(() => { setReschedulingId(null); setRescheduleData({ date: "", time: "" }); setRescheduleMsg(""); }, 1500);
      fetchData();
    } catch { toast.error("Failed to reschedule"); setRescheduleMsg("❌ Failed to reschedule"); }
  };

  const handleDownloadPDF = (bill) => {
    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();
    doc.setFillColor(37, 99, 235); doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(22);
    doc.text("HealSync", 105, 18, { align: "center" });
    doc.setFontSize(12); doc.text("HealSync Hospital", 105, 30, { align: "center" });
    doc.setTextColor(0, 0, 0); doc.setFontSize(18);
    doc.text("BILL / INVOICE", 105, 55, { align: "center" });
    doc.setFontSize(11); doc.setTextColor(100, 100, 100);
    doc.text(`Bill ID: ${bill._id}`, 20, 70);
    doc.text(`Date: ${bill.date}`, 20, 80);
    doc.text(`Status: ${bill.status.toUpperCase()}`, 20, 90);
    doc.setDrawColor(200, 200, 200); doc.line(20, 95, 190, 95);
    doc.setTextColor(0, 0, 0); doc.setFontSize(12);
    doc.text("Patient Details", 20, 108); doc.setFontSize(11); doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${bill.patient?.name || "N/A"}`, 20, 118);
    doc.text(`Phone: ${bill.patient?.phone || "N/A"}`, 20, 128);
    doc.setFontSize(12); doc.setTextColor(0, 0, 0);
    doc.text("Doctor Details", 110, 108); doc.setFontSize(11); doc.setTextColor(80, 80, 80);
    doc.text(`Name: ${bill.doctor?.name || "N/A"}`, 110, 118);
    doc.text(`Specialization: ${bill.doctor?.specialization || "N/A"}`, 110, 128);
    doc.setDrawColor(200, 200, 200); doc.line(20, 135, 190, 135);
    doc.setFontSize(14); doc.setTextColor(0, 0, 0); doc.text("Amount Details", 20, 148);
    doc.setFillColor(240, 249, 255); doc.rect(20, 155, 170, 20, "F");
    doc.setFontSize(13); doc.setTextColor(37, 99, 235); doc.text("Consultation Fee:", 25, 167);
    doc.setFontSize(16); doc.setTextColor(22, 163, 74); doc.text(`Rs. ${bill.amount}`, 165, 167, { align: "right" });
    doc.setFillColor(37, 99, 235); doc.rect(0, 270, 210, 30, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(10);
    doc.text("Thank you for choosing HealSync!", 105, 282, { align: "center" });
    doc.text("For queries: support@healsync.com", 105, 290, { align: "center" });
    doc.save(`HealSync_Bill_${bill._id}.pdf`);
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border border-amber-200",
      confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
      completed: "bg-green-100 text-green-700 border border-green-200",
      cancelled: "bg-red-100 text-red-700 border border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "appointments", icon: "📅", label: "Appointments" },
    { id: "book", icon: "➕", label: "Book Appointment" },
    { id: "bills", icon: "💳", label: "My Bills" },
    { id: "profile", icon: "👤", label: "Profile" },
  ];

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-blue-50"}`}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-blue-600 font-semibold">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed md:relative z-50 h-screen transition-all duration-300 flex-shrink-0 flex flex-col shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-r ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-20"}`}>
        <div className={`p-5 border-b ${darkMode ? "border-gray-700" : "border-gray-100"} flex items-center justify-between`}>
          <Logo darkMode={darkMode} sidebarOpen={sidebarOpen} />
          {sidebarOpen && <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">◀</button>}
        </div>

        {sidebarOpen && (
          <div className={`mx-3 mt-4 p-3 rounded-2xl ${darkMode ? "bg-gray-700" : "bg-blue-50"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {patient?.name?.charAt(0)?.toUpperCase() || "P"}
              </div>
              <div className="overflow-hidden">
                <p className={`font-semibold text-sm truncate ${darkMode ? "text-white" : "text-gray-800"}`}>{patient?.name || "Patient"}</p>
                <p className="text-xs text-blue-500">Patient</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 mt-2 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id ? "bg-blue-600 text-white shadow-md"
                : darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
              } ${!sidebarOpen && "justify-center"}`}>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className={`p-3 border-t ${darkMode ? "border-gray-700" : "border-gray-100"} space-y-1`}>
          <button onClick={toggleDarkMode}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"} ${!sidebarOpen && "justify-center"}`}>
            <span>{darkMode ? "☀️" : "🌙"}</span>
            {sidebarOpen && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
          </button>
          <button onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition text-red-500 hover:bg-red-50 ${darkMode && "hover:bg-red-900 hover:bg-opacity-30"} ${!sidebarOpen && "justify-center"}`}>
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`px-6 py-4 border-b flex items-center justify-between ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-sm`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>☰</button>
            <div>
              <h1 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-800"}`}>{navItems.find(n => n.id === activeTab)?.label}</h1>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell token={token} />
            <div className="text-right hidden sm:block">
              <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-700"}`}>
                Welcome back, {patient?.name?.split(" ")[0] || "Patient"}! 👋
              </p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {appointments.filter(a => a.status === "pending").length} pending appointments
              </p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Appointments", value: appointments.length, icon: "📅", bg: "from-blue-500 to-blue-600" },
                  { label: "Pending", value: appointments.filter(a => a.status === "pending").length, icon: "⏳", bg: "from-amber-400 to-amber-500" },
                  { label: "Completed", value: appointments.filter(a => a.status === "completed").length, icon: "✅", bg: "from-green-500 to-green-600" },
                  { label: "Unpaid Bills", value: bills.filter(b => b.status === "unpaid").length, icon: "💳", bg: "from-red-400 to-red-500" },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${stat.bg} shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-opacity-80 text-xs font-medium">{stat.label}</p>
                        <p className="text-4xl font-black mt-1">{stat.value}</p>
                      </div>
                      <div className="text-3xl opacity-80">{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`rounded-2xl border ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} shadow-sm overflow-hidden`}>
                <div className={`px-6 py-4 border-b flex justify-between items-center ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                  <h3 className={`font-bold text-base ${darkMode ? "text-white" : "text-gray-800"}`}>Recent Appointments</h3>
                  <button onClick={() => setActiveTab("appointments")} className="text-blue-500 text-sm font-semibold hover:underline">View all →</button>
                </div>
                {appointments.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="text-5xl mb-3">📅</div>
                    <p className={`font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>No appointments yet</p>
                    <button onClick={() => setActiveTab("book")} className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700">Book Now</button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {appointments.slice(0, 5).map((apt) => (
                      <div key={apt._id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">👨‍⚕️</div>
                          <div>
                            <p className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>{apt.doctor?.name || "Doctor"}</p>
                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{apt.doctor?.specialization} • {apt.date} at {apt.time}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(apt.status)}`}>{apt.status}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Book Appointment", icon: "📅", tab: "book" },
                  { label: "View Bills", icon: "💳", tab: "bills" },
                  { label: "My Appointments", icon: "📋", tab: "appointments" },
                  { label: "Edit Profile", icon: "✏️", tab: "profile" },
                ].map((action) => (
                  <button key={action.label} onClick={() => setActiveTab(action.tab)}
                    className={`p-4 rounded-2xl border-2 border-dashed text-center hover:border-blue-400 hover:bg-blue-50 transition ${darkMode ? "border-gray-600 hover:bg-blue-900 hover:bg-opacity-20" : "border-gray-200"}`}>
                    <div className="text-3xl mb-2">{action.icon}</div>
                    <p className={`text-xs font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{action.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* APPOINTMENTS */}
          {activeTab === "appointments" && (
            <div className="space-y-4">
              <SearchBar value={searchAppointments} onChange={(v) => { setSearchAppointments(v); setAptPage(1); }} placeholder="Search by doctor, status, date..." darkMode={darkMode} />
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Showing {filteredAppointments.length} of {appointments.length} appointments</p>
              {paginate(filteredAppointments, aptPage).length === 0 ? (
                <div className={`rounded-2xl border p-12 text-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <div className="text-6xl mb-4">🔍</div>
                  <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-700"}`}>No results found</p>
                </div>
              ) : paginate(filteredAppointments, aptPage).map((apt) => (
                <div key={apt._id} className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <div className="p-5">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-2xl shadow">👨‍⚕️</div>
                        <div>
                          <p className={`font-bold text-base ${darkMode ? "text-white" : "text-gray-800"}`}>{apt.doctor?.name || "Unknown"}</p>
                          <p className="text-blue-500 text-sm font-medium">{apt.doctor?.specialization}</p>
                          <div className={`flex items-center gap-3 mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            <span>📅 {apt.date}</span><span>⏰ {apt.time}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(apt.status)}`}>{apt.status}</span>
                        {apt.status === "pending" && (
                          <div className="flex gap-2">
                            <button onClick={() => { setReschedulingId(apt._id); setRescheduleData({ date: apt.date, time: apt.time }); setRescheduleMsg(""); }}
                              className="bg-purple-100 text-purple-600 text-xs px-3 py-1.5 rounded-lg hover:bg-purple-200 font-semibold">Reschedule</button>
                            <button onClick={() => handleCancelAppointment(apt._id)}
                              className="bg-red-100 text-red-500 text-xs px-3 py-1.5 rounded-lg hover:bg-red-200 font-semibold">Cancel</button>
                          </div>
                        )}
                      </div>
                    </div>
                    {apt.notes && (
                      <div className={`mt-3 px-4 py-2.5 rounded-xl text-sm ${darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-50 text-gray-600"}`}>📝 {apt.notes}</div>
                    )}
                  </div>
                  {reschedulingId === apt._id && (
                    <div className={`border-t px-5 pb-5 pt-4 ${darkMode ? "border-gray-700" : "border-gray-100 bg-purple-50"}`}>
                      <p className="text-purple-600 font-semibold text-sm mb-3">📅 Reschedule Appointment</p>
                      {rescheduleMsg && <div className={`px-4 py-2 rounded-lg text-sm mb-3 ${rescheduleMsg.includes("✅") ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{rescheduleMsg}</div>}
                      <form onSubmit={handleReschedule} className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>New Date</label>
                          <input type="date" value={rescheduleData.date} onChange={(e) => setRescheduleData({ ...rescheduleData, date: e.target.value })}
                            min={new Date().toISOString().split("T")[0]} required
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" />
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>New Time</label>
                          <select value={rescheduleData.time} onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })} required
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400">
                            <option value="">-- Select time --</option>
                            {["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM"].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2 flex gap-2">
                          <button type="submit" className="bg-purple-600 text-white text-sm px-4 py-2 rounded-xl hover:bg-purple-700 font-semibold">Confirm</button>
                          <button type="button" onClick={() => setReschedulingId(null)} className="bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-xl hover:bg-gray-300 font-semibold">Close</button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))}
              <Pagination currentPage={aptPage} totalPages={totalPages(filteredAppointments)} onPageChange={setAptPage} darkMode={darkMode} />
            </div>
          )}

          {/* BOOK APPOINTMENT */}
          {activeTab === "book" && (
            <div className="max-w-2xl">
              <div className={`rounded-2xl border shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <div className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                  <h3 className={`font-bold text-base ${darkMode ? "text-white" : "text-gray-800"}`}>Book New Appointment</h3>
                  <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Search and select a doctor to book your slot</p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Search Doctor</label>
                      <input type="text" placeholder="Search by name..." value={doctorSearch} onChange={(e) => setDoctorSearch(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 bg-gray-50"}`} />
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Specialization</label>
                      <select value={specializationFilter} onChange={(e) => setSpecializationFilter(e.target.value)}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 bg-gray-50"}`}>
                        <option value="">All Specializations</option>
                        {[...new Set(doctors.map(d => d.specialization).filter(Boolean))].map(spec => (
                          <option key={spec} value={spec}>{spec}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Select Doctor</label>
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {doctors.filter(doc =>
                        doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) &&
                        (specializationFilter === "" || doc.specialization === specializationFilter)
                      ).map(doc => (
                        <div key={doc._id} onClick={() => setBookingData({ ...bookingData, doctor: doc._id })}
                          className={`border-2 rounded-xl px-4 py-3 cursor-pointer transition flex justify-between items-center ${
                            bookingData.doctor === doc._id
                              ? "border-blue-500 bg-blue-50"
                              : `border-gray-100 hover:border-blue-300 ${darkMode ? "hover:bg-gray-700 border-gray-600" : "hover:bg-gray-50"}`
                          }`}>
                          <div>
                            <p className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>{doc.name}</p>
                            <p className="text-xs text-blue-500">{doc.specialization}</p>
                            <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-400"}`}>{doc.experience} yrs exp</p>
                          </div>
                          <div className="text-right">
                            <p className="text-blue-600 font-bold text-sm">₹{doc.fees}</p>
                            {bookingData.doctor === doc._id && <span className="text-green-500 text-xs">✓ Selected</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={handleBooking} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Date</label>
                        <input type="date" value={bookingData.date} onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                          required min={new Date().toISOString().split("T")[0]}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 bg-gray-50"}`} />
                      </div>
                      <div>
                        <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Time</label>
                        <select value={bookingData.time} onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })} required
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 bg-gray-50"}`}>
                          <option value="">-- Select time --</option>
                          {["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM"].map(t => (
                            <option key={t} value={t}>{t}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Notes (optional)</label>
                      <textarea value={bookingData.notes} onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                        placeholder="Describe your symptoms..." rows={3}
                        className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 bg-gray-50"}`} />
                    </div>
                    <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                      Confirm Booking →
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* BILLS */}
          {activeTab === "bills" && (
            <div className="space-y-4">
              <SearchBar value={searchBills} onChange={(v) => { setSearchBills(v); setBillPage(1); }} placeholder="Search by doctor or status..." darkMode={darkMode} />
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Showing {filteredBills.length} of {bills.length} bills</p>
              {paginate(filteredBills, billPage).length === 0 ? (
                <div className={`rounded-2xl border p-12 text-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <div className="text-6xl mb-4">🔍</div>
                  <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-700"}`}>No results found</p>
                </div>
              ) : paginate(filteredBills, billPage).map((bill) => (
                <div key={bill._id} className={`rounded-2xl border shadow-sm p-5 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow ${bill.status === "paid" ? "bg-green-100" : "bg-red-100"}`}>
                        {bill.status === "paid" ? "✅" : "💳"}
                      </div>
                      <div>
                        <p className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{bill.doctor?.name}</p>
                        <p className="text-blue-500 text-sm">{bill.doctor?.specialization}</p>
                        <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>📅 {bill.date}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-2xl font-black text-blue-600">₹{bill.amount}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bill.status === "paid" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{bill.status}</span>
                      <div className="flex gap-2">
                        {bill.status === "unpaid" && (
                          <button onClick={() => handleMarkPaid(bill._id)} className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600 font-semibold">Mark Paid</button>
                        )}
                        <button onClick={() => handleDownloadPDF(bill)} className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-600 font-semibold">📄 PDF</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <Pagination currentPage={billPage} totalPages={totalPages(filteredBills)} onPageChange={setBillPage} darkMode={darkMode} />
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && (
            <div className="max-w-lg">
              <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-black text-blue-600 mx-auto shadow-lg mb-3">
                    {patient?.name?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <p className="text-white font-black text-xl">{patient?.name}</p>
                  <p className="text-blue-200 text-sm mt-1">Patient</p>
                </div>
                <div className="p-6">
                  {patient ? (
                    <ProfileEditForm patient={patient} token={token} onUpdate={fetchData} darkMode={darkMode} />
                  ) : (
                    <p className={`text-center ${darkMode ? "text-gray-400" : "text-gray-500"}`}>No profile found.</p>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default PatientDashboard;
