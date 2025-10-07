import React from "react";

export default function CalculatorPanel({ title = "Quick Analyzer", children, onRun }) {
  return (
    <div className="bg-white border rounded shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        <div className="text-xs text-gray-500">Quick</div>
      </div>

      <div className="space-y-3">{children}</div>

      <div className="mt-4 flex justify-end">
        <button onClick={onRun} className="px-4 py-2 bg-blue-600 text-white rounded">Run</button>
      </div>
    </div>
  );
}
