import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import QuickStats from "./QuickStats";
import PropertyCard from "./PropertyCard";
import CalculatorPanel from "./CalculatorPanel";

/* Example mock data */
const mockProperties = [
  { id: 1, address: "2659 Oak Ave", city: "Boston, MA", price: 299000, beds: 3, baths: 1, rent: 2200 },
  { id: 2, address: "50 Island View", city: "Dorchester, MA", price: 149900, beds: 2, baths: 1, rent: 1200 },
  { id: 3, address: "Bucket road", city: "Dallas, TX", price: 375000, beds: 4, baths: 3, rent: 3000 },
  { id: 4, address: "72 Maple Ln", city: "Austin, TX", price: 225000, beds: 3, baths: 2, rent: 1800 }
];

export default function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [active, setActive] = React.useState("dashboard");

  function onAnalyze(property) {
    alert(`Analyze property: ${property.address} - opens calculator (implement navigation)`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleSidebar={() => setSidebarCollapsed(s => !s)} />
      <div className="flex">
        <Sidebar collapsed={sidebarCollapsed} onNavigate={setActive} active={active} />
        <div className="flex-1 p-6">
          <QuickStats stats={{ properties: mockProperties.length, avgCashflow: 1420, capRate: 6.8, profit: 18500 }} />

          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Properties</h2>
                <div className="text-sm text-gray-500">Showing {mockProperties.length} results</div>
              </div>

              <div className="space-y-3">
                {mockProperties.map(p => (
                  <PropertyCard key={p.id} p={p} onAnalyze={onAnalyze} />
                ))}
              </div>
            </div>

            <div>
              <CalculatorPanel title="Quick Rental Estimate" onRun={() => alert("Quick run - implement calc")}>
                <label className="block">
                  <div className="text-xs text-gray-500">Purchase Price</div>
                  <input className="w-full mt-1 border rounded px-2 py-1" type="number" defaultValue={200000} />
                </label>

                <label className="block">
                  <div className="text-xs text-gray-500">Estimated Rent / mo</div>
                  <input className="w-full mt-1 border rounded px-2 py-1" type="number" defaultValue={1700} />
                </label>

                <div className="text-sm text-gray-500">Use the full calculators for deeper analysis.</div>
              </CalculatorPanel>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white border rounded p-4">You saved <strong>Fix & Flip</strong> analysis for 2659 Oak Ave.</div>
              <div className="bg-white border rounded p-4">New property found near 11 Elm St — rent estimate updated.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
