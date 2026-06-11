import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">👤</div>
        <div>
          <p className="text-xl font-bold text-gray-700">{patient.name}</p>
          <p className="text-sm text-gray-500">Patient</p>
        </div>
      </div>
      {msg && <div className="bg-green-100 text-green-600 px-4 py-2 rounded-lg text-sm">✅ {msg}</div>}
      {err && <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm">❌ {err}</div>}
      {[
        { label: "Full Name", name: "name", type: "text" },
        { label: "Phone", name: "phone", type: "text" },
        { label: "Age", name: "age", type: "number" },
        { label: "Address", name: "address", type: "text" },
        { label: "Medical History", name: "medicalHistory", type: "text" },
      ].map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-gray-700 mb-1">{field.label}</label>
          <input type={field.type} value={form[field.name]}
            onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
        <select value={form.gender}
          onChange={(e) => setForm({ ...form, gender: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
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
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bookingData, setBookingData] = useState({ doctor: "", date: "", time: "", notes: "" });
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingError, setBookingError] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [specializationFilter, setSpecializationFilter] = useState("");
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [patientRes, appointmentsRes, doctorsRes, billsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/patients/me", config),
        axios.get("http://localhost:5000/api/appointments", config),
        axios.get("http://localhost:5000/api/doctors", config),
        axios.get("http://localhost:5000/api/bills", config),
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

  if (loading) return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center">
      <p className="text-blue-600 text-xl font-semibold">Loading...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">

      <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">🏥 HMS — Patient Portal</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Welcome, {patient?.name || "Patient"}!</span>
          <button onClick={handleLogout}
            className="bg-white text-blue-700 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-blue-100 transition">
            Logout
          </button>
        </div>
      </nav>

      <div className="bg-white shadow-sm px-6 py-2 flex gap-4 flex-wrap">
        {["dashboard", "appointments", "book", "bills", "profile"].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${
              activeTab === tab ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}>
            {tab === "book" ? "Book Appointment" : tab}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-5xl mx-auto">

        {activeTab === "dashboard" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Dashboard Overview</h2>
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
                <p className="text-gray-500 text-sm">Unpaid Bills</p>
                <p className="text-4xl font-bold text-red-500 mt-2">
                  {bills.filter(b => b.status === "unpaid").length}
                </p>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Appointments</h3>
              {appointments.length === 0 ? (
                <p className="text-gray-400 text-sm">No appointments yet. Book one!</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="pb-2">Doctor</th>
                      <th className="pb-2">Date</th>
                      <th className="pb-2">Time</th>
                      <th className="pb-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.slice(0, 5).map((apt) => (
                      <tr key={apt._id} className="border-b hover:bg-gray-50">
                        <td className="py-2">{apt.doctor?.name || "Doctor"}</td>
                        <td className="py-2">{apt.date}</td>
                        <td className="py-2">{apt.time}</td>
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
            <h2 className="text-2xl font-bold text-gray-700 mb-6">My Appointments</h2>
            {appointments.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-6 text-center">
                <p className="text-gray-400">No appointments found.</p>
                <button onClick={() => setActiveTab("book")}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700">
                  Book Appointment
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt) => (
                  <div key={apt._id} className="bg-white rounded-2xl shadow p-5 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-700">{apt.doctor?.name || "Unknown"}</p>
                      <p className="text-sm text-gray-500">{apt.doctor?.specialization}</p>
                      <p className="text-sm text-gray-500 mt-1">📅 {apt.date} at ⏰ {apt.time}</p>
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
                        <button onClick={() => handleCancelAppointment(apt._id)}
                          className="text-red-500 text-xs hover:underline">Cancel</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "book" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">Book Appointment</h2>
            <div className="bg-white rounded-2xl shadow p-6 max-w-lg">
              {bookingMessage && <div className="bg-green-100 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm">✅ {bookingMessage}</div>}
              {bookingError && <div className="bg-red-100 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm">❌ {bookingError}</div>}
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search Doctor</label>
                  <input type="text" placeholder="Search by name..." value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Specialization</label>
                  <select value={specializationFilter}
                    onChange={(e) => setSpecializationFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">-- All Specializations --</option>
                    {[...new Set(doctors.map(d => d.specialization).filter(Boolean))].map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {doctors.filter(doc =>
                      doc.name.toLowerCase().includes(doctorSearch.toLowerCase()) &&
                      (specializationFilter === "" || doc.specialization === specializationFilter)
                    ).map(doc => (
                      <div key={doc._id}
                        onClick={() => setBookingData({ ...bookingData, doctor: doc._id })}
                        className={`border rounded-xl px-4 py-3 cursor-pointer transition ${
                          bookingData.doctor === doc._id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                        }`}>
                        <p className="font-semibold text-gray-700 text-sm">{doc.name}</p>
                        <p className="text-xs text-blue-600">{doc.specialization}</p>
                        <p className="text-xs text-gray-500">Experience: {doc.experience} yrs · Fees: ₹{doc.fees}</p>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" value={bookingData.date}
                    onChange={(e) => setBookingData({ ...bookingData, date: e.target.value })}
                    required min={new Date().toISOString().split("T")[0]}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <select value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                    <option value="">-- Select time --</option>
                    {["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
                      "12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (optional)</label>
                  <textarea value={bookingData.notes}
                    onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
                    placeholder="Describe your symptoms..." rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" />
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
            <h2 className="text-2xl font-bold text-gray-700 mb-6">My Bills</h2>
            {bills.length === 0 ? (
              <div className="bg-white rounded-2xl shadow p-6 text-center">
                <p className="text-gray-400">No bills yet. Bills are generated when appointments are completed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bills.map((bill) => (
                  <div key={bill._id} className="bg-white rounded-2xl shadow p-5 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-700">{bill.doctor?.name}</p>
                      <p className="text-sm text-blue-600">{bill.doctor?.specialization}</p>
                      <p className="text-sm text-gray-500 mt-1">📅 {bill.date}</p>
                      <p className="text-sm text-gray-500">⏰ {bill.appointment?.time}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-2xl font-bold text-blue-600">₹{bill.amount}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        bill.status === "paid"
                          ? "bg-green-100 text-green-600"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {bill.status}
                      </span>
                      {bill.status === "unpaid" && (
                        <button onClick={() => handleMarkPaid(bill._id)}
                          className="bg-green-500 text-white text-xs px-3 py-1 rounded-lg hover:bg-green-600">
                          Mark as Paid
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-700 mb-6">My Profile</h2>
            <div className="bg-white rounded-2xl shadow p-6 max-w-lg">
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