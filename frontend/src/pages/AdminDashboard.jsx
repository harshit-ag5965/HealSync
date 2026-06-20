import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import useDarkMode from "../hooks/useDarkMode";
import NotificationBell from "../components/NotificationBell";
import SearchBar from "../components/SearchBar";
import Pagination from "../components/Pagination";
import Logo from "../components/Logo";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({ doctors: 0, patients: 0, appointments: 0, revenue: 0 });
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [bills, setBills] = useState([]);
  const [users, setUsers] = useState([]);

  const [doctorForm, setDoctorForm] = useState({ name: "", email: "", password: "", phone: "", specialization: "", experience: "", fees: "", address: "" });
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [editDoctorForm, setEditDoctorForm] = useState({});

  // Search states
  const [searchDoctors, setSearchDoctors] = useState("");
  const [searchPatients, setSearchPatients] = useState("");
  const [searchAppointments, setSearchAppointments] = useState("");
  const [searchBills, setSearchBills] = useState("");
  const [searchUsers, setSearchUsers] = useState("");

  // Pagination states
  const [doctorPage, setDoctorPage] = useState(1);
  const [patientPage, setPatientPage] = useState(1);
  const [appointmentPage, setAppointmentPage] = useState(1);
  const [billPage, setBillPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const PER_PAGE = 5;

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const { darkMode, toggleDarkMode } = useDarkMode();

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    const safe = async (fn) => {
      try { return await fn(); }
      catch (e) { console.warn("API failed:", e.config?.url, e.response?.status); return { data: [] }; }
    };
    const [doctorsRes, patientsRes, appointmentsRes, billsRes, usersRes] = await Promise.all([
      safe(() => axios.get("http://localhost:5000/api/doctors", config)),
      safe(() => axios.get("http://localhost:5000/api/patients", config)),
      safe(() => axios.get("http://localhost:5000/api/appointments", config)),
      safe(() => axios.get("http://localhost:5000/api/bills", config)),
      safe(() => axios.get("http://localhost:5000/api/auth/users", config)),
    ]);
    const d = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];
    const p = Array.isArray(patientsRes.data) ? patientsRes.data : [];
    const a = Array.isArray(appointmentsRes.data) ? appointmentsRes.data : [];
    const b = Array.isArray(billsRes.data) ? billsRes.data : [];
    const u = Array.isArray(usersRes.data) ? usersRes.data : [];
    setDoctors(d); setPatients(p); setAppointments(a); setBills(b); setUsers(u);
    const revenue = b.filter(bill => bill.status === "paid").reduce((sum, bill) => sum + (bill.amount || 0), 0);
    setStats({ doctors: d.length, patients: p.length, appointments: a.length, revenue });
    setLoading(false);
  };

  // Filtered lists
  const filteredDoctors = doctors.filter(d =>
    d.name?.toLowerCase().includes(searchDoctors.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchDoctors.toLowerCase())
  );
  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchPatients.toLowerCase()) ||
    p.phone?.toLowerCase().includes(searchPatients.toLowerCase())
  );
  const filteredAppointments = appointments.filter(a =>
    a.patient?.name?.toLowerCase().includes(searchAppointments.toLowerCase()) ||
    a.doctor?.name?.toLowerCase().includes(searchAppointments.toLowerCase()) ||
    a.status?.toLowerCase().includes(searchAppointments.toLowerCase())
  );
  const filteredBills = bills.filter(b =>
    b.patient?.name?.toLowerCase().includes(searchBills.toLowerCase()) ||
    b.status?.toLowerCase().includes(searchBills.toLowerCase())
  );
  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchUsers.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchUsers.toLowerCase())
  );

  const paginate = (arr, page) => arr.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = (arr) => Math.ceil(arr.length / PER_PAGE);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/doctors", doctorForm, config);
      toast.success("Doctor added successfully!");
      setDoctorForm({ name: "", email: "", password: "", phone: "", specialization: "", experience: "", fees: "", address: "" });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add doctor");
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm("Delete this doctor?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/doctors/${id}`, config);
      toast.success("Doctor deleted!");
      fetchAll();
    } catch { toast.error("Failed to delete doctor"); }
  };

  const handleEditDoctor = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/doctors/${editingDoctor}`, editDoctorForm, config);
      toast.success("Doctor updated!");
      setEditingDoctor(null);
      fetchAll();
    } catch { toast.error("Failed to update doctor"); }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Delete this patient?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/patients/${id}`, config);
      toast.success("Patient deleted!");
      fetchAll();
    } catch { toast.error("Failed to delete patient"); }
  };

  const handleDeleteAppointment = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/appointments/${id}`, config);
      toast.success("Appointment deleted!");
      fetchAll();
    } catch { toast.error("Failed to delete appointment"); }
  };

  const handleUpdateAppointmentStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/appointments/${id}`, { status }, config);
      toast.success(`Status updated to ${status}`);
      fetchAll();
    } catch { toast.error("Failed to update status"); }
  };

  const handleDeleteBill = async (id) => {
    if (!window.confirm("Delete this bill?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/bills/${id}`, config);
      toast.success("Bill deleted!");
      fetchAll();
    } catch { toast.error("Failed to delete bill"); }
  };

  const handleUpdateBillStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bills/${id}`, { status }, config);
      toast.success(`Bill marked as ${status}`);
      fetchAll();
    } catch { toast.error("Failed to update bill"); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/auth/users/${id}`, config);
      toast.success("User deleted!");
      fetchAll();
    } catch { toast.error("Failed to delete user"); }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-100 text-amber-700 border border-amber-200",
      confirmed: "bg-blue-100 text-blue-700 border border-blue-200",
      completed: "bg-green-100 text-green-700 border border-green-200",
      cancelled: "bg-red-100 text-red-700 border border-red-200",
      paid: "bg-green-100 text-green-700 border border-green-200",
      unpaid: "bg-red-100 text-red-700 border border-red-200",
    };
    return styles[status] || "bg-gray-100 text-gray-600";
  };

  const card = `rounded-2xl border shadow-sm ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"}`;
  const th = `px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide ${darkMode ? "text-gray-400" : "text-gray-500"}`;
  const td = `px-4 py-3 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`;
  const input = `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 ${darkMode ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" : "border-gray-200 bg-gray-50"}`;
  const label = `block text-xs font-semibold mb-1 ${darkMode ? "text-gray-300" : "text-gray-600"}`;

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "doctors", icon: "👨‍⚕️", label: "Doctors" },
    { id: "add-doctor", icon: "➕", label: "Add Doctor" },
    { id: "patients", icon: "🧑‍🤝‍🧑", label: "Patients" },
    { id: "appointments", icon: "📅", label: "Appointments" },
    { id: "bills", icon: "💳", label: "Bills" },
    { id: "users", icon: "👤", label: "Users" },
  ];

  // Dummy Chart Data combined with actual stats
  const chartData = [
    { name: 'Jan', revenue: 4000, appointments: 24 },
    { name: 'Feb', revenue: 3000, appointments: 18 },
    { name: 'Mar', revenue: 5000, appointments: 29 },
    { name: 'Apr', revenue: 4500, appointments: 25 },
    { name: 'May', revenue: 6000, appointments: 32 },
    { name: 'Jun', revenue: Math.max(stats.revenue, 7000), appointments: Math.max(stats.appointments, 40) }
  ];

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? "bg-gray-900" : "bg-green-50"}`}>
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-green-600 font-semibold">Loading admin panel...</p>
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

        {sidebarOpen && (
          <div className={`mx-3 mt-4 p-3 rounded-2xl ${darkMode ? "bg-gray-700" : "bg-green-50"}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-full flex items-center justify-center text-white font-black text-sm shadow">A</div>
              <div>
                <p className={`font-semibold text-sm ${darkMode ? "text-white" : "text-gray-800"}`}>Administrator</p>
                <p className="text-xs text-green-500">Full Access</p>
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
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-gray-100"
            } ${!sidebarOpen && "justify-center"}`}>
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`px-6 py-4 border-b flex items-center justify-between ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} shadow-sm`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}>☰</button>
            <div>
              <h1 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-800"}`}>
                {navItems.find(n => n.id === activeTab)?.label || "Dashboard"}
              </h1>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell token={token} />
            <div className="hidden sm:block text-right">
              <p className={`text-sm font-semibold ${darkMode ? "text-white" : "text-gray-700"}`}>Welcome, Admin! 👋</p>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{stats.appointments} total appointments</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">

          {/* DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Doctors", value: stats.doctors, icon: "👨‍⚕️", bg: "from-green-500 to-green-600" },
                  { label: "Total Patients", value: stats.patients, icon: "🧑‍🤝‍🧑", bg: "from-blue-500 to-blue-600" },
                  { label: "Appointments", value: stats.appointments, icon: "📅", bg: "from-purple-500 to-purple-600" },
                  { label: "Total Revenue", value: `₹${stats.revenue}`, icon: "💰", bg: "from-amber-400 to-amber-500" },
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

              {/* --- ANALYTICS CHARTS --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className={`${card} p-5`}>
                  <h3 className={`font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Revenue Overview</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#f3f4f6"} vertical={false} />
                        <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                          itemStyle={{ color: "#16a34a", fontWeight: "bold" }}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#16a34a" strokeWidth={3} dot={{ r: 4, fill: "#16a34a", strokeWidth: 2, stroke: darkMode ? "#1f2937" : "#fff" }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`${card} p-5`}>
                  <h3 className={`font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Appointments Trend</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#374151" : "#f3f4f6"} vertical={false} />
                        <XAxis dataKey="name" stroke={darkMode ? "#9ca3af" : "#6b7280"} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke={darkMode ? "#9ca3af" : "#6b7280"} fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: darkMode ? "#1f2937" : "#fff", borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}
                          cursor={{ fill: darkMode ? '#374151' : '#f3f4f6' }}
                          itemStyle={{ color: "#3b82f6", fontWeight: "bold" }}
                        />
                        <Bar dataKey="appointments" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={30} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              {/* ------------------------ */}

              <div className={card}>
                <div className={`px-6 py-4 border-b flex justify-between items-center ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                  <h3 className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>Recent Appointments</h3>
                  <button onClick={() => setActiveTab("appointments")} className="text-green-500 text-sm font-semibold hover:underline">View all →</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                      <tr>{["Patient","Doctor","Date","Time","Status"].map(h => <th key={h} className={th}>{h}</th>)}</tr>
                    </thead>
                    <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-50"}`}>
                      {appointments.slice(0, 5).map(apt => (
                        <tr key={apt._id} className={`transition ${darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}`}>
                          <td className={td}>{apt.patient?.name || "—"}</td>
                          <td className={td}>{apt.doctor?.name || "—"}</td>
                          <td className={td}>{apt.date}</td>
                          <td className={td}>{apt.time}</td>
                          <td className={td}><span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusBadge(apt.status)}`}>{apt.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`${card} p-5`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Appointment Status</p>
                  {["pending","confirmed","completed","cancelled"].map(s => (
                    <div key={s} className="flex justify-between items-center py-1.5">
                      <span className={`text-sm capitalize ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{s}</span>
                      <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{appointments.filter(a => a.status === s).length}</span>
                    </div>
                  ))}
                </div>
                <div className={`${card} p-5`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Bill Overview</p>
                  {[
                    { label: "Total Bills", val: bills.length },
                    { label: "Paid", val: bills.filter(b => b.status === "paid").length },
                    { label: "Unpaid", val: bills.filter(b => b.status === "unpaid").length },
                    { label: "Revenue", val: `₹${stats.revenue}` },
                  ].map(item => (
                    <div key={item.label} className="flex justify-between items-center py-1.5">
                      <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{item.label}</span>
                      <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{item.val}</span>
                    </div>
                  ))}
                </div>
                <div className={`${card} p-5`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Top Specializations</p>
                  {[...new Set(doctors.map(d => d.specialization))].filter(Boolean).slice(0, 5).map(spec => (
                    <div key={spec} className="flex justify-between items-center py-1.5">
                      <span className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>{spec}</span>
                      <span className={`text-sm font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{doctors.filter(d => d.specialization === spec).length}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* DOCTORS */}
          {activeTab === "doctors" && (
            <div className="space-y-4">
              <div className="flex gap-3 items-center">
                <SearchBar value={searchDoctors} onChange={(v) => { setSearchDoctors(v); setDoctorPage(1); }} placeholder="Search by name or specialization..." darkMode={darkMode} />
                <button onClick={() => setActiveTab("add-doctor")}
                  className="bg-green-600 text-white text-sm px-4 py-2.5 rounded-xl font-semibold hover:bg-green-700 transition shadow whitespace-nowrap">
                  ➕ Add Doctor
                </button>
              </div>
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Showing {filteredDoctors.length} of {doctors.length} doctors</p>
              {paginate(filteredDoctors, doctorPage).map(doc => (
                <div key={doc._id} className={`${card} p-5`}>
                  {editingDoctor === doc._id ? (
                    <div>
                      <p className={`font-bold mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>Edit Doctor</p>
                      <form onSubmit={handleEditDoctor} className="grid grid-cols-2 gap-3">
                        {["name","phone","specialization","experience","fees","address"].map(field => (
                          <div key={field}>
                            <label className={label}>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                            <input className={input} value={editDoctorForm[field] || ""}
                              onChange={e => setEditDoctorForm({ ...editDoctorForm, [field]: e.target.value })} />
                          </div>
                        ))}
                        <div className="col-span-2 flex gap-2">
                          <button type="submit" className="bg-green-600 text-white text-sm px-4 py-2 rounded-xl font-semibold hover:bg-green-700">Save</button>
                          <button type="button" onClick={() => setEditingDoctor(null)} className="bg-gray-200 text-gray-600 text-sm px-4 py-2 rounded-xl font-semibold hover:bg-gray-300">Cancel</button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow">
                          {doc.name?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{doc.name}</p>
                          <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{doc.specialization} • {doc.experience} yrs exp • ₹{doc.fees} fees</p>
                          <p className={`text-xs mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{doc.userId?.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingDoctor(doc._id); setEditDoctorForm({ name: doc.name, phone: doc.phone, specialization: doc.specialization, experience: doc.experience, fees: doc.fees, address: doc.address }); }}
                          className="bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-blue-600 font-semibold">✏️ Edit</button>
                        <button onClick={() => handleDeleteDoctor(doc._id)}
                          className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 font-semibold">🗑️ Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <Pagination currentPage={doctorPage} totalPages={totalPages(filteredDoctors)} onPageChange={setDoctorPage} darkMode={darkMode} />
            </div>
          )}

          {/* ADD DOCTOR */}
          {activeTab === "add-doctor" && (
            <div className="max-w-2xl">
              <div className={card}>
                <div className={`px-6 py-4 border-b ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                  <h3 className={`font-bold text-lg ${darkMode ? "text-white" : "text-gray-800"}`}>Register New Doctor</h3>
                  <p className={`text-xs mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Fill all fields to add a doctor to the system</p>
                </div>
                <div className="p-6">
                  <form onSubmit={handleAddDoctor} className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Full Name", name: "name", type: "text", col: 2 },
                      { label: "Email", name: "email", type: "email", col: 1 },
                      { label: "Password", name: "password", type: "password", col: 1 },
                      { label: "Phone", name: "phone", type: "text", col: 1 },
                      { label: "Specialization", name: "specialization", type: "text", col: 1 },
                      { label: "Experience (yrs)", name: "experience", type: "number", col: 1 },
                      { label: "Consultation Fees (₹)", name: "fees", type: "number", col: 1 },
                      { label: "Address", name: "address", type: "text", col: 2 },
                    ].map(f => (
                      <div key={f.name} className={f.col === 2 ? "col-span-2" : ""}>
                        <label className={label}>{f.label}</label>
                        <input type={f.type} required value={doctorForm[f.name]}
                          onChange={e => setDoctorForm({ ...doctorForm, [f.name]: e.target.value })}
                          className={input} />
                      </div>
                    ))}
                    <div className="col-span-2">
                      <button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all">
                        ➕ Add Doctor
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* PATIENTS */}
          {activeTab === "patients" && (
            <div className="space-y-4">
              <SearchBar value={searchPatients} onChange={(v) => { setSearchPatients(v); setPatientPage(1); }} placeholder="Search by name or phone..." darkMode={darkMode} />
              <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>Showing {filteredPatients.length} of {patients.length} patients</p>
              {paginate(filteredPatients, patientPage).map(p => (
                <div key={p._id} className={`${card} p-5 flex items-center justify-between`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow">
                      {p.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div>
                      <p className={`font-bold ${darkMode ? "text-white" : "text-gray-800"}`}>{p.name}</p>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                        {p.age ? `Age: ${p.age}` : ""} {p.gender ? `• ${p.gender}` : ""} {p.phone ? `• ${p.phone}` : ""}
                      </p>
                      <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>{p.userId?.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeletePatient(p._id)}
                    className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-600 font-semibold">🗑️ Delete</button>
                </div>
              ))}
              <Pagination currentPage={patientPage} totalPages={totalPages(filteredPatients)} onPageChange={setPatientPage} darkMode={darkMode} />
            </div>
          )}

          {/* APPOINTMENTS */}
          {activeTab === "appointments" && (
            <div className={`${card} overflow-hidden`}>
              <div className={`px-6 py-4 border-b flex items-center gap-3 flex-wrap ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                <h3 className={`font-bold flex-shrink-0 ${darkMode ? "text-white" : "text-gray-800"}`}>All Appointments ({filteredAppointments.length})</h3>
                <SearchBar value={searchAppointments} onChange={(v) => { setSearchAppointments(v); setAppointmentPage(1); }} placeholder="Search patient, doctor, status..." darkMode={darkMode} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>{["Patient","Doctor","Date","Time","Notes","Status","Actions"].map(h => <th key={h} className={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-50"}`}>
                    {paginate(filteredAppointments, appointmentPage).map(apt => (
                      <tr key={apt._id} className={`transition ${darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}`}>
                        <td className={td}>{apt.patient?.name || "—"}</td>
                        <td className={td}>{apt.doctor?.name || "—"}</td>
                        <td className={td}>{apt.date}</td>
                        <td className={td}>{apt.time}</td>
                        <td className={`${td} max-w-xs truncate`}>{apt.notes || "—"}</td>
                        <td className={td}>
                          <select value={apt.status} onChange={e => handleUpdateAppointmentStatus(apt._id, e.target.value)}
                            className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200"}`}>
                            {["pending","confirmed","completed","cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className={td}>
                          <button onClick={() => handleDeleteAppointment(apt._id)}
                            className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600 font-semibold">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4">
                <Pagination currentPage={appointmentPage} totalPages={totalPages(filteredAppointments)} onPageChange={setAppointmentPage} darkMode={darkMode} />
              </div>
            </div>
          )}

          {/* BILLS */}
          {activeTab === "bills" && (
            <div className={`${card} overflow-hidden`}>
              <div className={`px-6 py-4 border-b flex items-center gap-3 flex-wrap ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                <h3 className={`font-bold flex-shrink-0 ${darkMode ? "text-white" : "text-gray-800"}`}>All Bills ({filteredBills.length})</h3>
                <SearchBar value={searchBills} onChange={(v) => { setSearchBills(v); setBillPage(1); }} placeholder="Search patient or status..." darkMode={darkMode} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>{["Patient","Doctor","Date","Amount","Status","Actions"].map(h => <th key={h} className={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-50"}`}>
                    {paginate(filteredBills, billPage).map(bill => (
                      <tr key={bill._id} className={`transition ${darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}`}>
                        <td className={td}>{bill.patient?.name || "—"}</td>
                        <td className={td}>{bill.doctor?.name || "—"}</td>
                        <td className={td}>{bill.date}</td>
                        <td className={`${td} font-bold text-green-600`}>₹{bill.amount}</td>
                        <td className={td}>
                          <select value={bill.status} onChange={e => handleUpdateBillStatus(bill._id, e.target.value)}
                            className={`border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none ${darkMode ? "bg-gray-700 border-gray-600 text-white" : "border-gray-200"}`}>
                            {["paid","unpaid"].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                        <td className={td}>
                          <button onClick={() => handleDeleteBill(bill._id)}
                            className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600 font-semibold">🗑️</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4">
                <Pagination currentPage={billPage} totalPages={totalPages(filteredBills)} onPageChange={setBillPage} darkMode={darkMode} />
              </div>
            </div>
          )}

          {/* USERS */}
          {activeTab === "users" && (
            <div className={`${card} overflow-hidden`}>
              <div className={`px-6 py-4 border-b flex items-center gap-3 flex-wrap ${darkMode ? "border-gray-700" : "border-gray-100"}`}>
                <h3 className={`font-bold flex-shrink-0 ${darkMode ? "text-white" : "text-gray-800"}`}>All Users ({filteredUsers.length})</h3>
                <SearchBar value={searchUsers} onChange={(v) => { setSearchUsers(v); setUserPage(1); }} placeholder="Search name, email or role..." darkMode={darkMode} />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                    <tr>{["Name","Email","Role","Actions"].map(h => <th key={h} className={th}>{h}</th>)}</tr>
                  </thead>
                  <tbody className={`divide-y ${darkMode ? "divide-gray-700" : "divide-gray-50"}`}>
                    {paginate(filteredUsers, userPage).map(u => (
                      <tr key={u._id} className={`transition ${darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"}`}>
                        <td className={td}>{u.name || "—"}</td>
                        <td className={td}>{u.email}</td>
                        <td className={td}>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            u.role === "admin" ? "bg-purple-100 text-purple-700" :
                            u.role === "doctor" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                          }`}>{u.role}</span>
                        </td>
                        <td className={td}>
                          {u.role !== "admin" && (
                            <button onClick={() => handleDeleteUser(u._id)}
                              className="bg-red-500 text-white text-xs px-2 py-1 rounded-lg hover:bg-red-600 font-semibold">🗑️ Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="p-4">
                <Pagination currentPage={userPage} totalPages={totalPages(filteredUsers)} onPageChange={setUserPage} darkMode={darkMode} />
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;