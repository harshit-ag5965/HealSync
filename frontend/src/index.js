import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: { borderRadius: "12px", fontWeight: "600", fontSize: "14px" },
        success: { style: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" } },
        error: { style: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" } },
      }}
    />
  </React.StrictMode>
);

reportWebVitals();