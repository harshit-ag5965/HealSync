import React, { useState } from "react";
import BASE_URL from "../api";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "patient",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post(`${BASE_URL}/api/auth/register`, formData);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
    setLoading(false);
  };

  const roles = [
    { value: "patient", label: "Patient", icon: "👤", desc: "Book appointments & manage health", color: "blue" },
    { value: "doctor", label: "Doctor", icon: "👨‍⚕️", desc: "Manage appointments & patients", color: "cyan" },
  ];

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f4c81 0%, #1a6bb5 50%, #2196F3 100%)" }}>

        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full opacity-5"></div>
        <div className="absolute bottom-20 -left-20 w-60 h-60 bg-blue-300 rounded-full opacity-10"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "35px 35px"
        }}></div>

        {/* Logo */}
        <div className="relative">
  <Logo sidebarOpen={true} darkMode={true} />
</div>

        {/* Center */}
        <div className="relative">
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            Join thousands of <br />
            <span className="text-blue-200">healthcare professionals</span>
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-10">
            Create your free account today and start managing your healthcare journey with HealSync.
          </p>

          {/* Role Cards */}
          <div className="space-y-4">
            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-5 border border-white border-opacity-20">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="text-white font-bold">As a Patient</p>
                  <p className="text-blue-200 text-xs">Book appointments, view records</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["Book appointments", "Medical records", "Bill management", "Email reminders"].map(f => (
                  <div key={f} className="flex items-center gap-1">
                    <span className="text-green-400 text-xs">✓</span>
                    <span className="text-blue-100 text-xs">{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-5 border border-white border-opacity-20">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">👨‍⚕️</span>
                <div>
                  <p className="text-white font-bold">As a Doctor</p>
                  <p className="text-blue-200 text-xs">Manage patients & earnings</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {["Manage appointments", "View patient records", "Earnings dashboard", "Reschedule visits"].map(f => (
                  <div key={f} className="flex items-center gap-1">
                    <span className="text-green-400 text-xs">✓</span>
                    <span className="text-blue-100 text-xs">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative text-center">
          <p className="text-blue-200 text-sm">Already have an account?</p>
          <button onClick={() => navigate("/login")}
            className="mt-2 text-white font-bold text-sm border border-white border-opacity-30 px-6 py-2 rounded-xl hover:bg-white hover:bg-opacity-10 transition">
            Sign in instead →
          </button>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile logo view - updated to HealSync */}
<div className="lg:hidden mb-8 flex justify-center">
  <Logo darkMode={false} sidebarOpen={true} />
</div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900">Create account</h2>
              <p className="text-gray-500 mt-2">Join HealSync and take control of your healthcare</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Role Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                {roles.map((r) => (
                  <button key={r.value} type="button"
                    onClick={() => setFormData({ ...formData, role: r.value })}
                    className={`p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                      formData.role === r.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300 bg-white"
                    }`}>
                    <div className="text-2xl mb-2">{r.icon}</div>
                    <p className={`font-bold text-sm ${formData.role === r.value ? "text-blue-700" : "text-gray-700"}`}>
                      {r.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
                    {formData.role === r.value && (
                      <div className="mt-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">👤</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">📧</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔒</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    required
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm transition"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Password strength */}
              {formData.password.length > 0 && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                        formData.password.length >= i * 2
                          ? formData.password.length >= 8 ? "bg-green-500"
                          : formData.password.length >= 4 ? "bg-yellow-500"
                          : "bg-red-500"
                          : "bg-gray-200"
                      }`}></div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {formData.password.length < 4 ? "Too short" :
                     formData.password.length < 6 ? "Weak" :
                     formData.password.length < 8 ? "Good" : "Strong ✓"}
                  </p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold text-base hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:scale-100 mt-2">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Creating account...
                  </span>
                ) : `Create ${formData.role === "patient" ? "Patient" : "Doctor"} Account →`}
              </button>
            </form>

            <p className="text-center text-gray-400 text-xs mt-5">
              By registering, you agree to our Terms of Service
            </p>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-xs">already registered?</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <Link to="/login"
              className="block w-full text-center border-2 border-gray-200 text-gray-600 py-3 rounded-xl font-semibold text-sm hover:border-blue-400 hover:text-blue-600 transition">
              Sign in to your account
            </Link>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
            © 2026 HealSync. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
