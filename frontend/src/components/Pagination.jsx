import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange, darkMode }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
          currentPage === 1
            ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400"
            : darkMode
            ? "bg-gray-700 text-white hover:bg-gray-600"
            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >← Prev</button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-bold transition ${
            p === currentPage
              ? "bg-green-600 text-white shadow"
              : darkMode
              ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
              : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >{p}</button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${
          currentPage === totalPages
            ? "opacity-40 cursor-not-allowed bg-gray-100 text-gray-400"
            : darkMode
            ? "bg-gray-700 text-white hover:bg-gray-600"
            : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >Next →</button>

      <span className={`text-xs ml-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
        Page {currentPage} of {totalPages}
      </span>
    </div>
  );
};

export default Pagination;