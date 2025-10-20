import React from "react";
import { generateReportPDF } from "/src/Utility/report.jsx";  // a function has to be created in the report.js file.

export default function RentalCalculator() {
  const [inputs, setInputs] = React.useState({
    purchasePrice: 200000,
    downPaymentPercent: 20,
    rent: 1500,
    vacancyPercent: 5,
    annualExpenses: 4000,
    mortgageRate: 4.0,
    mortgageYears: 30
  });

  function handleChange(e) {
    const { name, value } = e.target;
    setInputs(prev => ({ ...prev, [name]: Number(value) }));
  }

  function monthlyMortgage(principal, annualRate, years) {
    const r = annualRate / 100 / 12;
    const n = years * 12;
    if (r === 0) return principal / n;
    return (principal * r) / (1 - Math.pow(1 + r, -n));
  }

  const loanAmount = inputs.purchasePrice * (1 - inputs.downPaymentPercent / 100);
  const monthlyMortgagePayment = monthlyMortgage(loanAmount, inputs.mortgageRate, inputs.mortgageYears);
  const monthlyIncome = inputs.rent * (1 - inputs.vacancyPercent / 100);
  const monthlyExpenses = inputs.annualExpenses / 12 + monthlyMortgagePayment;

  const monthlyCashflow = monthlyIncome - monthlyExpenses;
  const annualCashflow = monthlyCashflow * 12;
  const capRate = (inputs.rent * 12 - inputs.annualExpenses) / inputs.purchasePrice;

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Rental Property Cashflow Calculator</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "Purchase Price", name: "purchasePrice" },
          { label: "Down Payment (%)", name: "downPaymentPercent" },
          { label: "Monthly Rent", name: "rent" },
          { label: "Vacancy (%)", name: "vacancyPercent" },
          { label: "Annual Expenses", name: "annualExpenses" },
          { label: "Mortgage Rate (%)", name: "mortgageRate" },
          { label: "Mortgage Years", name: "mortgageYears" }
        ].map(f => (
          <label key={f.name} className="block">
            <div className="text-sm text-gray-600">{f.label}</div>
            <input type="number" name={f.name} value={inputs[f.name]} onChange={handleChange} className="mt-1 block w-full border rounded px-3 py-2" />
          </label>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Monthly Mortgage</div>
          <div className="text-xl font-medium">${monthlyMortgagePayment.toFixed(2)}</div>
        </div>
        <div className="p-4 border rounded">
          <div className="text-sm text-gray-500">Monthly Cashflow</div>
          <div className="text-xl font-medium">${monthlyCashflow.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Annual Cashflow: ${annualCashflow.toFixed(2)}</div>
          <div className="text-sm text-gray-500">Cap Rate: {(capRate * 100).toFixed(2)}%</div>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        <button onClick={() => generateReportPDF({ type: "Rental", inputs, monthlyCashflow, annualCashflow })} className="px-4 py-2 bg-blue-600 text-white rounded">Generate Report (PDF)</button>
      </div>
    </div>
  );
}
