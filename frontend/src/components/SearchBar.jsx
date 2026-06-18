import React from "react";

const SearchBar = ({ value, onChange, placeholder, darkMode }) => {
  return (
    <div className="relative w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search..."}
        className={`pl-9 pr-8 py-2.5 rounded-xl border text-sm w-full focus:outline-none focus:ring-2 focus:ring-green-400 transition ${
          darkMode
            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
            : "bg-white border-gray-200 text-gray-700 placeholder-gray-400"
        }`}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg leading-none"
        >×</button>
      )}
    </div>
  );
};

export default SearchBar;