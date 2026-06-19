import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
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
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      if (res.data.role === "doctor") navigate("/doctor-dashboard");
      else if (res.data.role === "admin") navigate("/admin-dashboard");
      else navigate("/patient-dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">

      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #0f4c81 0%, #1a6bb5 50%, #2196F3 100%)" }}>

        {/* Background circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white rounded-full opacity-5"></div>
        <div className="absolute bottom-20 -left-20 w-60 h-60 bg-blue-300 rounded-full opacity-10"></div>
        <div className="absolute top-1/2 right-10 w-40 h-40 bg-white rounded-full opacity-5"></div>

        {/* Logo */}
        <div className="relative">
  <Logo sidebarOpen={true} darkMode={true} />
</div>

        {/* Center content */}
        <div className="relative">
          <h1 className="text-4xl font-black text-white mb-4 leading-tight">
            Welcome back to <br />
            <span className="text-blue-200">your Health Portal</span>
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-10">
            Access your appointments, medical records, and more — all in one place.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {[
              { icon: "📅", text: "Manage appointments in real-time" },
              { icon: "🔔", text: "Get instant notifications" },
              { icon: "📄", text: "Access medical records anytime" },
              { icon: "💳", text: "View and download bills as PDF" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-10 rounded-xl flex items-center justify-center">
                  <span className="text-xl">{item.icon}</span>
                </div>
                <span className="text-blue-100 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative bg-white bg-opacity-10 backdrop-blur-sm rounded-2xl p-5 border border-white border-opacity-20">
          <p className="text-blue-100 text-sm italic">"HealSync has transformed how we manage our hospital operations. Highly recommended!"</p>
          <p className="text-blue-300 text-xs mt-2 font-semibold">— Dr. Rakesh Gupta, Cardiologist</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">

{/* Mobile logo view - updated to HealSync */}
<div className="lg:hidden mb-8 flex justify-center">
  <Logo darkMode={false} sidebarOpen={true} />
</div>

          <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-black text-gray-900">Sign in</h2>
              <p className="text-gray-500 mt-2">Enter your credentials to access your dashboard</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-sm transition"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link to="/forgot-password"
                  className="text-blue-600 text-sm font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold text-base hover:shadow-lg hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:scale-100">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Signing in...
                  </span>
                ) : "Sign In →"}
              </button>
            </form>


            <p className="text-center text-gray-500 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-bold hover:underline">
                Create one free →
              </Link>
            </p>
          </div>

          <p className="text-center text-gray-400 text-xs mt-6">
        © 2026 HealSync. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;