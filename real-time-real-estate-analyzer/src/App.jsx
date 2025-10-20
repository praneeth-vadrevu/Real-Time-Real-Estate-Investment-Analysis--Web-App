import React from "react";
import Dashboard from "./components/Dashboard";
import RentalCalculator from "./components/RentalCalculator";
import ReportPage from "./components/ReportPage";

export default function App() {
  const [page, setPage] = React.useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="py-4 px-4">
          <nav className="flex gap-2">
            <button className="px-3 py-1 rounded bg-white" onClick={() => setPage("dashboard")}>Dashboard</button>
            <button className="px-3 py-1 rounded bg-white" onClick={() => setPage("rental")}>Rental</button>
            <button className="px-3 py-1 rounded bg-white" onClick={() => setPage("fixflip")}>Fix & Flip</button>
            <button className="px-3 py-1 rounded bg-white" onClick={() => setPage("wholesale")}>Wholesaling</button>
            <button className="px-3 py-1 rounded bg-white" onClick={() => setPage("rehab")}>Rehab</button>
            <button className="px-3 py-1 rounded bg-white" onClick={() => setPage("report")}>Reports</button>
          </nav>
        </div>

        <main className="px-4 pb-8">
          {page === "dashboard" && <Dashboard />}
          {page === "rental" && <RentalCalculator />}
          {page === "fixflip" && <FixFlipCalculator />}
          {page === "wholesale" && <WholesalingCalculator />}
          {page === "rehab" && <RehabEstimator />}
          {page === "report" && <ReportPage />}
        </main>
      </div>
    </div>
  );
}
