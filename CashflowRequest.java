package com.example.analysis.dto;

/**
 * Input DTO for investment cashflow analysis.
 * All money values are assumed to be the same currency (e.g., USD).
 * Percentage fields are expressed as fractions (e.g., 20% => 0.20).
 */
public class CashflowRequest {
  // Identification (optional, for display/reporting)
  public String address; public String city; public String state; public String zip;

  // Valuation & pricing
  public Double fmv;                 // Fair Market Value
  public Double offerPrice;          // Offer (purchase) price used for cap rate (PP) and RPP
  public Double annualAppreciation;  // Annual property appreciation rate (0–1)

  // Income (annual)
  public Double grossRentsAnnual;    // Total annual rent (all units)
  public Integer numberOfUnits;      // Number of units (for per-unit metrics)
  public Double parkingAnnual;       // Parking income
  public Double storageAnnual;       // Storage income
  public Double laundryVendingAnnual;// Laundry/vending income
  public Double otherIncomeAnnual;   // Other income

  // Vacancy & management (rates)
  public Double vacancyRate;         // Vacancy as a fraction of Total Income
  public Double managementRate;      // Property management fee rate
  public Double repairsRate;         // Repairs/maintenance rate (applied to gross rent)

  // Operating expenses (annual, flat dollar amounts)
  public Double propertyTaxes; public Double insurance; public Double electricity;
  public Double gas; public Double waterSewer; public Double cable;
  public Double caretaking; public Double advertising; public Double associationFees; // HOA
  public Double pest; public Double security; public Double trash; public Double misc;
  public Double commonAreaMaintenance; public Double capitalImprovements;
  public Double accounting; public Double legal; public Double badDebts;
  public Double evictions; public Double otherExpenses;

  // Financing – primary (1st) loan
  public Double firstPrincipal;        // Loan amount (principal borrowed)
  public Double firstRateAnnual;       // APR, e.g., 0.0675
  public Integer firstAmortYears;      // Amortization term in years
  public Integer firstInterestOnlyYears; // Interest-only years at the beginning (0 if none)

  // Financing – secondary (2nd) loan (optional)
  public Double secondPrincipal; public Double secondRateAnnual; public Integer secondAmortYears;

  // Other monthly financing costs (e.g., servicing fees)
  public Double otherMonthlyFinancingCosts;

  // Closing costs and rehab (used to compute RPP and cash-to-close)
  public Double repairs; public Double repairsContingency;
  public Double lenderFee; public Double brokerFee; public Double environmentals;
  public Double inspections; public Double appraisals; public Double transferTax; public Double legalClose;
  public Double otherClosingCosts;

  // Growth & hold
  public Integer holdYears;         // Projection horizon in years
  public Double rentGrowth;         // Annual growth rate for income streams
  public Double expenseGrowth;      // Annual growth rate for expenses
  public Double exitCostRate;       // Selling cost rate applied at exit

  // Management fee base: "EGI" (default) or "GROSS_RENTS"
  public String managementBase;
}
