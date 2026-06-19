import React from "react";
import { useNavigate } from "react-router-dom";
import useDarkMode from "../hooks/useDarkMode";
import Logo from "../components/Logo"; // Import your logo component

const NotFound = () => {
  const navigate = useNavigate();
  const { darkMode } = useDarkMode();

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? "bg-gray-900" : "bg-green-50"} transition-colors duration-300`}>
      <div className="text-center px-6">
        
        {/* Replace 🏥 with your HealSync Logo */}
        <div className="flex justify-center mb-6 animate-bounce">
          <Logo darkMode={darkMode} sidebarOpen={true} />
        </div>

        <h1 className={`text-6xl font-black mb-4 ${darkMode ? "text-white" : "text-gray-800"}`}>
          404
        </h1>
        <p className={`text-xl font-semibold mb-2 ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
          Oops! Page Not Found
        </p>
        <p className={`text-sm mb-8 max-w-md mx-auto ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          The page you are looking for doesn't exist or has been moved. Let's get you back to safety.
        </p>
        
        <button 
          onClick={() => navigate("/")}
          className="bg-green-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700 hover:shadow-lg transition-all"
        >
          ← Go Back Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;