import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-700">Edit Doctor</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        {msg && <div className="bg-green-100 text-green-600 px-4 py-2 rounded-lg text-sm mb-3">✅ {msg}</div>}
        {err && <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm mb-3">❌ {err}</div>}

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
              <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
              <input
                type={field.type}
                value={form[field.name]}
                onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
            </div>
          ))}
          <div className="flex gap-3">
            <button type="submit"
              className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-semibold hover:bg-purple-700 transition">
              Save Changes
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [newDoctor, setNewDoctor] = useState({
    name: "", email: "", password: "", phone: "",
    specialization: "", experience: "", fees: "", address: "",
  });
  const [doctorMsg, setDoctorMsg] = useState("");
  const [doctorErr, setDoctorErr] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [doctorsRes, patientsRes, appointmentsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/doctors", config),
        axios.get("http://localhost:5000/api/patients", config),
        axios.get("http://localhost:5000/api/appointments", config),
      ]);
      setDoctors(Array.isArray(doctorsRes.data) ? doctorsRes.data : []);
      setPatients(Array.isArray(patientsRes.data) ? patientsRes.data : []);
      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
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

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <p className="text-purple-600 text-xl font-semibold">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      <nav className="bg-purple-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">🏥 HMS — Admin Panel</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, Admin!</span>
          <button onClick={handleLogout}
            className="bg-white text-purple-700 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-purple-100 transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="bg-white shadow-sm px-6 py-2 flex gap-4 flex-wrap">
        {["dashboard", "doctors", "patients", "appointments", "add-doctor"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              activeTab === tab ? "bg-purple-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}>
            {tab === "add-doctor" ? "Add Doctor" : tab}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-6xl mx-auto">

        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Hospital Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-purple-500">
                <p className="text-gray-500 text-sm">Total Doctors</p>
                <p className="text-4xl font-bold text-purple-600 mt-2">{doctors.length}</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-500">
                <p className="text-gray-500 text-sm">Total Patients</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{patients.length}</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-yellow-500">
                <p className="text-gray-500 text-sm">Total Appointments</p>
                <p className="text-4xl font-bold text-yellow-500 mt-2">{appointments.length}</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-500">
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-4xl font-bold text-green-500 mt-2">
                  {appointments.filter(a => a.status === "completed").length}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Appointments</h3>
              {appointments.length === 0 ? (
                <p className="text-gray-400 text-sm">No appointments yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Patient</th>
                      <th className="pb-2">Doctor</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 5).map((apt) => (
                      <tr key={apt._id} className="border-b hover:bg-gray-50">
                        <td className="py-2">{apt.patient?.name || "N/A"}</td>
                        <td className="py-2">{apt.doctor?.name || "N/A"}</td>
                        <td className="py-2">{apt.date}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
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
            <h2 className="text-2xl font-bold text-gray-700 mb-6">All Doctors ({doctors.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div key={doc._id} className="bg-white rounded-2xl shadow p-5 flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">👨‍⚕️</div>
                    <div>
                      <p className="font-semibold text-gray-700">{doc.name}</p>
                      <p className="text-sm text-purple-600">{doc.specialization}</p>
                      <p className="text-sm text-gray-500">Experience: {doc.experience} yrs</p>
                      <p className="text-sm text-gray-500">Fees: ₹{doc.fees}</p>
                      <p className="text-sm text-gray-500">{doc.address}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => setEditingDoctor(doc)}
                      className="bg-purple-100 text-purple-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-purple-200">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteDoctor(doc._id)}
                      className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-200">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "patients" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">All Patients ({patients.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patients.map((pat) => (
                <div key={pat._id} className="bg-white rounded-2xl shadow p-5 flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">👤</div>
                    <div>
                      <p className="font-semibold text-gray-700">{pat.name}</p>
                      <p className="text-sm text-gray-500">Age: {pat.age} | {pat.gender}</p>
                      <p className="text-sm text-gray-500">Phone: {pat.phone}</p>
                      <p className="text-sm text-gray-500">History: {pat.medicalHistory}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeletePatient(pat._id)}
                    className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-200">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">All Appointments ({appointments.length})</h2>
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div key={apt._id} className="bg-white rounded-2xl shadow p-5 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-700">{apt.patient?.name || "Patient"}</p>
                    <p className="text-sm text-gray-500">Doctor: {apt.doctor?.name || "N/A"} — {apt.doctor?.specialization}</p>
                    <p className="text-sm text-gray-500 mt-1">📅 {apt.date} at ⏰ {apt.time}</p>
                    {apt.notes && <p className="text-sm text-gray-400 mt-1">📝 {apt.notes}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "add-doctor" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Add New Doctor</h2>
            <div className="bg-white rounded-2xl shadow p-6 max-w-lg">
              {doctorMsg && <div className="bg-green-100 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">✅ {doctorMsg}</div>}
              {doctorErr && <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">❌ {doctorErr}</div>}
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
                    <input
                      type={field.type}
                      placeholder={field.placeholder}
                      value={newDoctor[field.name]}
                      onChange={(e) => setNewDoctor({ ...newDoctor, [field.name]: e.target.value })}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
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