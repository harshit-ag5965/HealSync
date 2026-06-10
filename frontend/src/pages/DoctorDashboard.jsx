import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const DoctorDashboard = () => {
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const decoded = jwtDecode(token);
      const loggedInUserId = decoded.id;
      console.log("Logged in user ID from token:", loggedInUserId);

      const [doctorsRes, appointmentsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/doctors", config),
        axios.get("http://localhost:5000/api/appointments", config),
      ]);

      const allDoctors = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];
      console.log("All doctors from API:", allDoctors);
      console.log("Each doctor's userId:", allDoctors.map(d => ({ name: d.name, userId: d.userId })));

      const myDoctor = allDoctors.find(
  (doc) => doc.userId?._id?.toString() === loggedInUserId
);
      console.log("Matched doctor:", myDoctor);
      setDoctor(myDoctor);

      const allAppointments = Array.isArray(appointmentsRes.data)
        ? appointmentsRes.data
        : [];
      const myAppointments = allAppointments.filter(
        (apt) => apt.doctor?._id?.toString() === myDoctor?._id?.toString()
      );
      setAppointments(myAppointments);

    } catch (error) {
      console.error("fetchData error:", error);
    }
    setLoading(false);
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/appointments/${id}`,
        { status },
        config
      );
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

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p className="text-blue-600 text-xl font-semibold">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Navbar */}
      <nav className="bg-green-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">🏥 HMS — Doctor Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">
            Welcome, {doctor?.name || "Doctor"}!
          </span>
          <button
            onClick={handleLogout}
            className="bg-white text-green-700 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-green-100 transition"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white shadow-sm px-6 py-2 flex gap-4">
        {["dashboard", "appointments", "patients", "profile"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "bg-green-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-5xl mx-auto">

        {/* ── DASHBOARD TAB ── */}
        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">
              Dashboard Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-blue-500">
                <p className="text-gray-500 text-sm">Total Appointments</p>
                <p className="text-4xl font-bold text-blue-600 mt-2">{appointments.length}</p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-yellow-500">
                <p className="text-gray-500 text-sm">Pending</p>
                <p className="text-4xl font-bold text-yellow-500 mt-2">
                  {appointments.filter((a) => a.status === "pending").length}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-green-500">
                <p className="text-gray-500 text-sm">Completed</p>
                <p className="text-4xl font-bold text-green-500 mt-2">
                  {appointments.filter((a) => a.status === "completed").length}
                </p>
              </div>
              <div className="bg-white rounded-2xl shadow p-6 border-l-4 border-red-500">
                <p className="text-gray-500 text-sm">Cancelled</p>
                <p className="text-4xl font-bold text-red-500 mt-2">
                  {appointments.filter((a) => a.status === "cancelled").length}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Today's Appointments</h3>
              {appointments.length === 0 ? (
                <p className="text-gray-400 text-sm">No appointments today.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Patient</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 5).map((apt) => (
                      <tr key={apt._id} className="border-b hover:bg-gray-50">
                        <td className="py-2">{apt.patient?.name || "Patient"}</td>
                        <td className="py-2">{apt.date}</td>
                        <td className="py-2">{apt.time}</td>
                        <td className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="py-2">
                          {apt.status === "pending" && (
                            <button
                              onClick={() => handleUpdateStatus(apt._id, "confirmed")}
                              className="text-blue-500 text-xs hover:underline mr-2"
                            >
                              Confirm
                            </button>
                          )}
                          {apt.status === "confirmed" && (
                            <button
                              onClick={() => handleUpdateStatus(apt._id, "completed")}
                              className="text-green-500 text-xs hover:underline"
                            >
                              Complete
                            </button>
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
            <h2 className="text-2xl font-bold text-gray-700 mb-6">All Appointments</h2>
            {appointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-6 text-center">
                <p className="text-gray-400">No appointments found.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt._id} className="bg-white rounded-2xl shadow p-5 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-700">{apt.patient?.name || "Patient"}</p>
                      <p className="text-sm text-gray-500 mt-1">📅 {apt.date} at ⏰ {apt.time}</p>
                      {apt.notes && <p className="text-sm text-gray-400 mt-1">📝 {apt.notes}</p>}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                      <div className="flex gap-2">
                        {apt.status === "pending" && (
                          <button
                            onClick={() => handleUpdateStatus(apt._id, "confirmed")}
                            className="bg-blue-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-blue-600"
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status === "confirmed" && (
                          <button
                            onClick={() => handleUpdateStatus(apt._id, "completed")}
                            className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600"
                          >
                            Complete
                          </button>
                        )}
                        {(apt.status === "pending" || apt.status === "confirmed") && (
                          <button
                            onClick={() => handleUpdateStatus(apt._id, "cancelled")}
                            className="bg-red-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PATIENTS TAB ── */}
        {activeTab === "patients" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">My Patients</h2>
            {appointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-6 text-center">
                <p className="text-gray-400">No patients yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...new Map(appointments.map((a) => [a.patient?._id, a.patient])).values()]
                  .filter(Boolean)
                  .map((patient) => (
                    <div key={patient._id} className="bg-white rounded-2xl shadow p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                          👤
                        </div>
                        <div>
                          <p className="font-semibold text-gray-700">{patient.name}</p>
                          <p className="text-sm text-gray-500">{patient.phone}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
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

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">My Profile</h2>
            <div className="bg-white rounded-2xl shadow p-6 max-w-lg">
              {doctor ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
                      👨‍⚕️
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-700">{doctor.name}</p>
                      <p className="text-sm text-green-600 font-medium">{doctor.specialization}</p>
                    </div>
                  </div>
                  {[
                    { label: "Specialization", value: doctor.specialization },
                    { label: "Experience", value: doctor.experience ? `${doctor.experience} years` : "N/A" },
                    { label: "Fees", value: doctor.fees ? `₹${doctor.fees}` : "N/A" },
                    { label: "Address", value: doctor.address },
                    { label: "Available", value: doctor.isAvailable ? "Yes" : "No" },
                  ].map((item) => (
                    <div key={item.label} className="border-b pb-3">
                      <p className="text-xs text-gray-400 uppercase">{item.label}</p>
                      <p className="text-gray-700 font-medium mt-1">{item.value || "Not provided"}</p>
                    </div>
                  ))}
                </div>
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