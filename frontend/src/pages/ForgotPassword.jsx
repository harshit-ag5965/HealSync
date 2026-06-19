import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Logo from "../components/Logo";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setMessage(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
        
        {/* Header with HealSync Logo */}
        <div className="flex flex-col items-center mb-8">
          <Logo sidebarOpen={true} />
          <h2 className="text-xl font-black text-gray-800 mt-6">Forgot Password?</h2>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Enter your email and we'll send you a secure reset link.
          </p>
        </div>

        {/* Success message */}
        {message && (
          <div className="bg-green-50 text-green-600 px-4 py-3 rounded-xl mb-6 text-sm text-center font-medium">
            ✅ {message}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm text-center font-medium">
            ❌ {error}
          </div>
        )}

        {/* Form */}
        {!message && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
            >
              {loading ? "Sending..." : "Send Reset Link →"}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <Link to="/login" className="text-blue-600 text-sm font-semibold hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;