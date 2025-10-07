import React from "react";
import { FiSearch, FiBell } from "react-icons/fi";

export default function Header({ onToggleSidebar }) {
  return (
    <header className="flex items-center justify-between py-3 px-4 bg-white border-b">
      <div className="flex items-center gap-3">
        <button aria-label="toggle sidebar" onClick={onToggleSidebar} className="p-2 rounded hover:bg-gray-100">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>

        <div>
          <h1 className="text-lg font-semibold">Real-time Real Estate Analyzer</h1>
          <div className="text-xs text-gray-500">Investment calculators & deal analysis</div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <input placeholder="Search address, ZIP or MLS..." className="pl-9 pr-3 py-2 border rounded-full w-72 text-sm focus:outline-none focus:ring" />
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
        </div>

        <button className="p-2 rounded hover:bg-gray-100"><FiBell /></button>

        <div className="flex items-center gap-2 p-1 rounded hover:bg-gray-100 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm">EA</div>
          <div className="hidden md:block">
            <div className="text-sm font-medium">Donald Trump</div>
            <div className="text-xs text-gray-500">Admin</div>
          </div>
        </div>
      </div>
    </header>
  );
}
