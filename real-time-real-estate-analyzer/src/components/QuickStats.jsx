import React from "react";

function Stat({ title, value, subtitle }) {
  return (
    <div className="p-4 bg-white border rounded shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
      {subtitle && <div className="text-sm text-gray-500 mt-1">{subtitle}</div>}
    </div>
  );
}

export default function QuickStats({ stats = {} }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Stat title="Properties" value={stats.properties ?? 12} subtitle="Active" />
      <Stat title="Avg Cashflow" value={`$${(stats.avgCashflow ?? 650).toLocaleString()}`} subtitle="Monthly" />
      <Stat title="Avg Cap Rate" value={`${(stats.capRate ?? 7.2).toFixed(2)}%`} subtitle="Annual" />
      <Stat title="Potential Profit" value={`$${(stats.profit ?? 12000).toLocaleString()}`} subtitle="Avg / deal" />
    </div>
  );
}

