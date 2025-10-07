import React from "react";

export default function PropertyCard({ p = {}, onAnalyze }) {
  const { address = "123 Main St", city = "Anytown", price = 220000, beds = 3, baths = 2, rent = 1800 } = p;

  return (
    <div className="bg-white border rounded overflow-hidden shadow-sm flex">
      <div className="w-36 h-24 bg-gray-100 flex items-center justify-center text-gray-400">
        <div className="text-xs">Photo</div>
      </div>

      <div className="flex-1 p-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm font-semibold">{address}</div>
            <div className="text-xs text-gray-500">{city}</div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500">Asking</div>
            <div className="text-lg font-semibold">${price.toLocaleString()}</div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
          <div>{beds} bd</div>
          <div>{baths} ba</div>
          <div>{rent ? `$${rent}/mo est` : "Rent unknown"}</div>
        </div>

        <div className="mt-3 flex gap-2">
          <button onClick={() => onAnalyze && onAnalyze(p)} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Analyze</button>
          <button className="px-3 py-1 border rounded text-sm">Save</button>
        </div>
      </div>
    </div>
  );
}
