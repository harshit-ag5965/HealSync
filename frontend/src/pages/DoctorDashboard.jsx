import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import useDarkMode from "../hooks/useDarkMode";
import NotificationBell from "../components/NotificationBell";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import Logo from "../components/Logo";

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [bills, setBills] = useState([]);
  const [patientRecords, setPatientRecords] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [reschedulingId, setReschedulingId] = useState(null);
  const [rescheduleData, setRescheduleData] = useState({ date: "", time: "" });
  const [rescheduleMsg, setRescheduleMsg] = useState("");
  const [editForm, setEditForm] = useState(null);
  const [editMsg, setEditMsg] = useState("");

  // Search & Pagination
  const [searchAppointments, setSearchAppointments] = useState("");
  const [searchPatients, setSearchPatients] = useState("");
  const [aptPage, setAptPage] = useState(1);
  const [patientPage, setPatientPage] = useState(1);
  const PER_PAGE = 5;

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { darkMode, toggleDarkMode } = useDarkMode();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      const myDoctor = allDoctors.find(doc => doc.userId?._id?.toString() === loggedInUserId);
      setDoctor(myDoctor);
      if (myDoctor) setEditForm({ name: myDoctor.name || "", phone: myDoctor.phone || "", address: myDoctor.address || "", specialization: myDoctor.specialization || "", experience: myDoctor.experience || "", fees: myDoctor.fees || "" });
      const allAppointments = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
      setAppointments(allAppointments.filter(apt => apt.doctor?._id?.toString() === myDoctor?._id?.toString()));
      setEarnings(earningsRes.data);
      const allBills = Array.isArray(billsRes.data) ? billsRes.data : [];
      setBills(allBills.filter(bill => bill.doctor?._id?.toString() === myDoctor?._id?.toString()));
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const myPatients = [...new Map(appointments.map(a => [a.patient?._id, a.patient])).values()].filter(Boolean);

  const filteredAppointments = appointments.filter(a =>
    a.patient?.name?.toLowerCase().includes(searchAppointments.toLowerCase()) ||
    a.status?.toLowerCase().includes(searchAppointments.toLowerCase()) ||
    a.date?.includes(searchAppointments)
  );
  const filteredPatients = myPatients.filter(p =>
    p.name?.toLowerCase().includes(searchPatients.toLowerCase()) ||
    p.phone?.toLowerCase().includes(searchPatients.toLowerCase())
  );

  const paginate = (arr, page) => arr.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = (arr) => Math.ceil(arr.length / PER_PAGE);

  const fetchPatientRecords = async (patientId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/medical-records/patient/${patientId}`, config);
      setPatientRecords(Array.isArray(res.data) ? res.data : []);
      setSelectedPatient(patientId);
    } catch (error) { console.error(error); }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, { status }, config);
      toast.success(`Appointment ${status}!`);
      fetchData();
    } catch { toast.error("Failed to update status"); }
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    setRescheduleMsg("");
    try {
      await axios.put(`http://localhost:5000/api/appointments/${reschedulingId}`,
        { date: rescheduleData.date, time: rescheduleData.time }, config);
      toast.success("Rescheduled successfully!");
      setRescheduleMsg("✅ Rescheduled successfully!");
      setTimeout(() => { setReschedulingId(null); setRescheduleData({ date: "", time: "" }); setRescheduleMsg(""); }, 1500);
      fetchData();
    } catch { toast.error("Failed to reschedule"); setRescheduleMsg("❌ Failed to reschedule"); }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    setEditMsg("");
    try {
      await axios.put(`http://localhost:5000/api/doctors/${doctor._id}`, editForm, config);
      toast.success("Profile updated!");
      setEditMsg("✅ Profile updated!");
      fetchData();
    } catch { toast.error("Failed to update profile"); setEditMsg("❌ Failed to update"); }
  };

  const handleDownloadPDF = (bill) => {
    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();
    doc.setFillColor(21, 128, 61); doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(22);
    doc.text("HealSync", 105, 18, { align: "center" });
    doc.setFontSize(12); doc.text("HealSync", 105, 30, { align: "center" });
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
    doc.setFillColor(240, 253, 244); doc.rect(20, 155, 170, 20, "F");
    doc.setFontSize(13); doc.setTextColor(21, 128, 61); doc.text("Consultation Fee:", 25, 167);
    doc.setFontSize(16); doc.setTextColor(22, 163, 74); doc.text(`Rs. ${bill.amount}`, 165, 167, { align: "right" });
    doc.setFillColor(21, 128, 61); doc.rect(0, 270, 210, 30, "F");
    doc.setTextColor(255, 255, 255); doc.setFontSize(10);
    doc.text("Thank you for choosing  HealSync!", 105, 282, { align: "center" });
    doc.text("For queries: support@healsync.com", 105, 290, { align: "center" });
    doc.save(`HealSync_Bill_${bill._id}.pdf`);
  };

  const handleLogout = () => { localStorage.removeItem("token"); localStorage.removeItem("role"); navigate("/login"); };

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
    { id: "patients", icon: "👥", label: "My Patients" },
    { id: "records", icon: "📁", label: "Patient Records" },
    { id: "earnings", icon: "💰", label: "Earnings" },
    { id: "bills", icon: "💳", label: "Bills" },
    { id: "profile", icon: "👨‍⚕️", label: "Profile" },
  ];

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-green-50"}`}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-green-600 font-semibold">Loading your dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen flex ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 h-screen transition-all duration-300 flex-shrink-0 flex flex-col shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} border-r ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0 md:w-20"}`}>
        <div className={`p-5 border-b ${darkMode ? "border-gray-700" : "border-gray-100"} flex items-center justify-between`}>
  
  {/* 🚀 Your brand new SVG Logo Component */}
  <Logo darkMode={darkMode} sidebarOpen={sidebarOpen} />

  {sidebarOpen && <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600">◀</button>}
</div>

        {sidebarOpen && doctor && (
          <div className={`mx-3 mt-4 p-3 rounded-2xl ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {doctor?.name?.charAt(0)?.toUpperCase() || "D"}
              </div>
              <div className="overflow-hidden">
                <p className={`font-semibold text-sm truncate ${darkMode ? "text-white" : "text-gray-800"}`}>{doctor?.name}</p>
                <p className="text-xs text-green-500">{doctor?.specialization}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 mt-2 space-y-1">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === item.id ? "bg-green-600 text-white shadow-md"
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
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition ${darkMode && "hover:bg-red-900 hover:bg-opacity-30"} ${!sidebarOpen && "justify-center"}`}>
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
            <div className="hidden sm:block text-right">
              <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-700"}`}>
                Welcome, Dr. {doctor?.name ? doctor.name.replace(/^Dr\.?\s*/i, "").split(" ")[0] : "Doctor"}! 👋
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
                  { label: "Total Appointments", value: appointments.length, icon: "📅", bg: "from-green-500 to-green-600" },
                  { label: "Pending", value: appointments.filter(a => a.status === "pending").length, icon: "⏳", bg: "from-amber-400 to-amber-500" },
                  { label: "Completed", value: appointments.filter(a => a.status === "completed").length, icon: "✅", bg: "from-blue-500 to-blue-600" },
                  { label: "Total Earned", value: `₹${earnings?.totalEarnings || 0}`, icon: "💰", bg: "from-purple-500 to-purple-600" },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${stat.bg} shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-opacity-80 text-xs font-medium">{stat.label}</p>
                        <p className="text-3xl font-black mt-1">{stat.value}</p>
                      </div>
                      <div className="text-3xl opacity-80">{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <div className={`px-6 py-4 border-b flex justify-between items-center ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                  <h3 className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Recent Appointments</h3>
                  <button onClick={() => setActiveTab("appointments")} className="text-green-500 text-sm font-semibold hover:underline">View all →</button>
                </div>
                {appointments.length === 0 ? (
                  <div className="p-10 text-center">
                    <div className="text-5xl mb-3">📅</div>
                    <p className={`font-semibold ${darkMode ? "text-gray-300" : "text-gray-600"}`}>No appointments yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {appointments.slice(0, 5).map((apt) => (
                      <div key={apt._id} className="px-6 py-4 flex justify-between items-center hover:bg-gray-50 transition">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">👤</div>
                          <div>
                            <p className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>{apt.patient?.name || "Patient"}</p>
                            <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{apt.date} at {apt.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(apt.status)}`}>{apt.status}</span>
                          {apt.status === "pending" && <button onClick={() => handleUpdateStatus(apt._id, "confirmed")} className="text-blue-500 text-xs hover:underline font-semibold">Confirm</button>}
                          {apt.status === "confirmed" && <button onClick={() => handleUpdateStatus(apt._id, "completed")} className="text-green-500 text-xs hover:underline font-semibold">Complete</button>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* APPOINTMENTS */}
          {activeTab === "appointments" && (
            <div className="space-y-4">
              <SearchBar value={searchAppointments} onChange={(v) => { setSearchAppointments(v); setAptPage(1); }} placeholder="Search by patient, status, date..." darkMode={darkMode} />
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
                        <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-2xl shadow">👤</div>
                        <div>
                          <p className={`font-bold text-base ${darkMode ? "text-white" : "text-gray-800"}`}>{apt.patient?.name || "Patient"}</p>
                          <div className={`flex items-center gap-3 mt-1 text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                            <span>📅 {apt.date}</span><span>⏰ {apt.time}</span>
                          </div>
                          {apt.notes && <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>📝 {apt.notes}</p>}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(apt.status)}`}>{apt.status}</span>
                        <div className="flex gap-2 flex-wrap justify-end">
                          {apt.status === "pending" && <button onClick={() => handleUpdateStatus(apt._id, "confirmed")} className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-600 font-semibold">Confirm</button>}
                          {apt.status === "confirmed" && <button onClick={() => handleUpdateStatus(apt._id, "completed")} className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600 font-semibold">Complete</button>}
                          {(apt.status === "pending" || apt.status === "confirmed") && (
                            <>
                              <button onClick={() => { setReschedulingId(apt._id); setRescheduleData({ date: apt.date, time: apt.time }); setRescheduleMsg(""); }}
                                className="bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-purple-600 font-semibold">Reschedule</button>
                              <button onClick={() => handleUpdateStatus(apt._id, "cancelled")}
                                className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 font-semibold">Cancel</button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
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
                            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200"}`} />
                        </div>
                        <div>
                          <label className={`block text-xs font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>New Time</label>
                          <select value={rescheduleData.time} onChange={(e) => setRescheduleData({ ...rescheduleData, time: e.target.value })} required
                            className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200"}`}>
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

          {/* PATIENTS */}
          {activeTab === "patients" && (
            <div className="space-y-4">
              <SearchBar value={searchPatients} onChange={(v) => { setSearchPatients(v); setPatientPage(1); }} placeholder="Search by name or phone..." darkMode={darkMode} />
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Showing {filteredPatients.length} of {myPatients.length} patients</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPatients.length === 0 ? (
                  <div className={`col-span-2 rounded-2xl border p-12 text-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                    <div className="text-6xl mb-4">🔍</div>
                    <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-700"}`}>No results found</p>
                  </div>
                ) : paginate(filteredPatients, patientPage).map((patient) => (
                  <div key={patient._id} className={`rounded-2xl border shadow-sm p-5 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow">
                        {patient.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-bold text-base ${darkMode ? "text-white" : "text-gray-800"}`}>{patient.name}</p>
                        <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{patient.phone}</p>
                      </div>
                    </div>
                    <div className={`grid grid-cols-2 gap-2 mb-4 text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      <span>Age: {patient.age || "N/A"}</span>
                      <span>Gender: {patient.gender || "N/A"}</span>
                    </div>
                    <button onClick={() => { fetchPatientRecords(patient._id); setActiveTab("records"); }}
                      className="w-full bg-green-50 text-green-600 border border-green-200 text-sm py-2 rounded-xl font-semibold hover:bg-green-100 transition">
                      📁 View Records
                    </button>
                  </div>
                ))}
              </div>
              <Pagination currentPage={patientPage} totalPages={totalPages(filteredPatients)} onPageChange={setPatientPage} darkMode={darkMode} />
            </div>
          )}

          {/* RECORDS */}
          {activeTab === "records" && (
            <div className="space-y-4">
              <div className={`rounded-2xl border shadow-sm p-4 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <label className={`block text-sm font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Select Patient</label>
                <select value={selectedPatient || ""} onChange={(e) => fetchPatientRecords(e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200"}`}>
                  <option value="">-- Select a patient --</option>
                  {myPatients.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                </select>
              </div>
              {!selectedPatient ? (
                <div className={`rounded-2xl border p-12 text-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <div className="text-5xl mb-3">👆</div>
                  <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>Select a patient to view records</p>
                </div>
              ) : patientRecords.length === 0 ? (
                <div className={`rounded-2xl border p-12 text-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <div className="text-5xl mb-3">📁</div>
                  <p className={`${darkMode ? "text-gray-400" : "text-gray-500"}`}>No records found for this patient</p>
                </div>
              ) : patientRecords.map((record) => (
                <div key={record._id} className={`rounded-2xl border shadow-sm p-5 flex justify-between items-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <div>
                    <p className={`font-semibold ${darkMode ? "text-white" : "text-gray-800"}`}>📄 {record.title}</p>
                    {record.description && <p className={`text-sm mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{record.description}</p>}
                    <p className="text-xs text-gray-400 mt-1">Uploaded: {new Date(record.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    {!record.fileUrl?.toLowerCase().includes(".pdf") && (
                      <a href={record.fileUrl} target="_blank" rel="noreferrer" className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-600 font-semibold">👁️ View</a>
                    )}
                    <button onClick={() => {
                      const url = record.fileUrl?.includes("cloudinary.com") ? record.fileUrl.replace("/raw/upload/", "/raw/upload/fl_attachment/") : record.fileUrl;
                      window.open(url, "_blank");
                    }} className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600 font-semibold">⬇️ Download</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EARNINGS */}
          {activeTab === "earnings" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Earned", value: `₹${earnings?.totalEarnings || 0}`, icon: "💰", bg: "from-green-500 to-green-600" },
                  { label: "Total Bills", value: earnings?.totalBills || 0, icon: "📄", bg: "from-blue-500 to-blue-600" },
                  { label: "Paid Bills", value: earnings?.paidBills || 0, icon: "✅", bg: "from-purple-500 to-purple-600" },
                  { label: "Unpaid Bills", value: earnings?.unpaidBills || 0, icon: "⏳", bg: "from-amber-400 to-amber-500" },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${stat.bg} shadow-lg`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white text-opacity-80 text-xs font-medium">{stat.label}</p>
                        <p className="text-3xl font-black mt-1">{stat.value}</p>
                      </div>
                      <div className="text-3xl opacity-80">{stat.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
              {earnings?.monthly?.length > 0 && (
                <div className={`rounded-2xl border shadow-sm p-6 ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <h3 className={`font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Monthly Breakdown</h3>
                  <div className="space-y-3">
                    {earnings.monthly.map(m => (
                      <div key={m.month} className="flex justify-between items-center py-2 border-b last:border-0">
                        <p className={`font-medium ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{m.month}</p>
                        <p className="text-green-600 font-bold">₹{m.amount}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BILLS */}
          {activeTab === "bills" && (
            <div className="space-y-4">
              {bills.length === 0 ? (
                <div className={`rounded-2xl border p-12 text-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <div className="text-6xl mb-4">💳</div>
                  <p className={`text-xl font-bold ${darkMode ? "text-white" : "text-gray-700"}`}>No bills yet</p>
                </div>
              ) : bills.map((bill) => (
                <div key={bill._id} className={`rounded-2xl border shadow-sm p-5 flex justify-between items-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${bill.status === "paid" ? "bg-green-100" : "bg-amber-100"}`}>
                      {bill.status === "paid" ? "✅" : "⏳"}
                    </div>
                    <div>
                      <p className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{bill.patient?.name || "Patient"}</p>
                      <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>📅 {bill.date}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <p className="text-2xl font-black text-green-600">₹{bill.amount}</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${bill.status === "paid" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{bill.status}</span>
                    <button onClick={() => handleDownloadPDF(bill)} className="bg-green-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-green-600 font-semibold">📄 Download PDF</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROFILE */}
          {activeTab === "profile" && doctor && (
            <div className="max-w-lg">
              <div className={`rounded-2xl border shadow-sm overflow-hidden ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`}>
                <div className="bg-gradient-to-br from-green-600 to-green-800 p-8 text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-3xl font-black text-green-600 mx-auto shadow-lg mb-3">
                    {doctor?.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <p className="text-white font-black text-xl">{doctor?.name}</p>
                  <p className="text-green-200 text-sm mt-1">{doctor?.specialization}</p>
                </div>
                <div className="p-6 space-y-4">
                  {editMsg && <div className={`px-4 py-2 rounded-xl text-sm ${editMsg.includes("✅") ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>{editMsg}</div>}
                  <form onSubmit={handleEditProfile} className="space-y-4">
                    {editForm && [
                      { label: "Full Name", name: "name", type: "text" },
                      { label: "Phone", name: "phone", type: "text" },
                      { label: "Specialization", name: "specialization", type: "text" },
                      { label: "Experience (years)", name: "experience", type: "number" },
                      { label: "Fees (₹)", name: "fees", type: "number" },
                      { label: "Address", name: "address", type: "text" },
                    ].map(field => (
                      <div key={field.name}>
                        <label className={`block text-sm font-semibold mb-1.5 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>{field.label}</label>
                        <input type={field.type} value={editForm[field.name] || ""}
                          onChange={(e) => setEditForm({ ...editForm, [field.name]: e.target.value })}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200 bg-gray-50"}`} />
                      </div>
                    ))}
                    <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                      Save Changes →
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default DoctorDashboard;