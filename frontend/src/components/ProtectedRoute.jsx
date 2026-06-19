import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  let role = localStorage.getItem("role");

  // 1. If there is no token, kick them back to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 2. If a specific role is required and they don't match it
  if (allowedRole && role !== allowedRole) {
    
    // Check if role actually exists in localStorage
    if (role) {
      // Force it to lowercase just in case it was saved as "Doctor" or "Admin"
      const safeRole = role.toLowerCase(); 
      return <Navigate to={`/${safeRole}-dashboard`} replace />;
    } else {
      // If they have a token but no role somehow, send them to login to get a fresh start
      return <Navigate to="/login" replace />;
    }
  }

  // 3. If they pass the checks, render the component!
  return children;
};

export default ProtectedRoute;