import React from "react";

export default function ReportPage() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Reports</h2>
      <p className="text-sm text-gray-600">Reports generated from calculators will be downloadable as PDFs here.</p>
      {/* Extend to show saved reports from server/localStorage */}
    </div>
  );
}
