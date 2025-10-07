import React from "react";
import { FiHome, FiDollarSign, FiActivity, FiFileText, FiSettings } from "react-icons/fi";

export default function Sidebar({ collapsed, onNavigate, active }) {
  const links = [
    { id: "dashboard", label: "Dashboard", icon: <FiHome /> },
    { id: "rental", label: "Rental Calc", icon: <FiDollarSign /> },
    { id: "fixflip", label: "Fix & Flip", icon: <FiActivity /> },
    { id: "wholesale", label: "Wholesaling", icon: <FiFileText /> },
    { id: "settings", label: "Settings", icon: <FiSettings /> }
  ];

  return (
    <aside className={`flex-shrink-0 bg-white border-r ${collapsed ? "w-16" : "w-64"} transition-width duration-200`}>
      <div className="py-4 px-3">
        <div className="mb-6 px-2">
          <div className="text-sm font-bold">{collapsed ? "RREA" : "Real-time Analyzer"}</div>
        </div>

        <nav className="space-y-1">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => onNavigate(l.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-50 text-sm ${active === l.id ? "bg-gray-100 font-medium" : "text-gray-700"}`}
            >
              <div className="text-lg">{l.icon}</div>
              {!collapsed && <span>{l.label}</span>}
            </button>
          ))}
        </nav>
      </div>
    </aside>
  );
}
