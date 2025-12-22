package com.example.analysis.service;

import com.example.analysis.dto.CashflowRequest;
import com.example.analysis.dto.CashflowResponse;

import java.util.ArrayList;
import java.util.List;

/**
 * Core calculator for investment cashflow (before tax).
 * Implements Year-1 KPIs and multi-year projection with optional interest-only period,
 * principal pay-down, appreciation, and exit proceeds.
 */
public class CashflowService {

  /**
   * Runs the cashflow analysis and produces summary metrics plus yearly projections.
   * Calculates Year 1 KPIs and projects cashflows over the holding period.
   * 
   * @param r The cashflow request containing all property and financial parameters
   * @return CashflowResponse with summary metrics and yearly projections
   */
  public CashflowResponse analyze(CashflowRequest r) {
    // Set default values for hold period and growth rates
    int holdYears = nzInt(r.holdYears, 10);
    double rentGrowthRate = nz(r.rentGrowth);
    double expenseGrowthRate = nz(r.expenseGrowth);
    double appreciationRate = nz(r.annualAppreciation);
    double exitCostRate = nz(r.exitCostRate);

    // Calculate Year 1 total income from all sources
    double totalIncomeY1 = nz(r.grossRentsAnnual) + nz(r.parkingAnnual) + nz(r.storageAnnual)
        + nz(r.laundryVendingAnnual) + nz(r.otherIncomeAnnual);
    
    // Calculate vacancy loss as negative value
    double vacancyLossY1 = totalIncomeY1 * nz(r.vacancyRate) * -1.0;
    
    // Effective Gross Income = Total Income - Vacancy Loss
    double effectiveGrossIncomeY1 = totalIncomeY1 + vacancyLossY1;

    // Management fee base can be either EGI or Gross Rents
    double managementBaseY1 = "GROSS_RENTS".equalsIgnoreCase(r.managementBase)
        ? nz(r.grossRentsAnnual) : effectiveGrossIncomeY1;
    double managementFeeY1 = nz(r.managementRate) * Math.max(0, managementBaseY1);

    // Repairs expense is calculated as a percentage of gross rents
    double repairsExpenseY1 = nz(r.repairsRate) * nz(r.grossRentsAnnual);

    // Sum all other operating expenses (flat dollar amounts)
    double otherOperatingExpensesY1 = sum(
      r.propertyTaxes, r.insurance, r.electricity, r.gas, r.waterSewer, r.cable,
      r.caretaking, r.advertising, r.associationFees, r.pest, r.security, r.trash, r.misc,
      r.commonAreaMaintenance, r.capitalImprovements, r.accounting, r.legal, r.badDebts,
      r.evictions, r.otherExpenses
    );
    
    // Total expenses = Management + Repairs + Other Operating Expenses
    double totalExpensesY1 = managementFeeY1 + repairsExpenseY1 + otherOperatingExpensesY1;
    
    // Net Operating Income = Effective Gross Income - Total Expenses
    double netOperatingIncomeY1 = effectiveGrossIncomeY1 - totalExpensesY1;

    // Set up financing: first mortgage (required) and second mortgage (optional)
    Amort firstMortgage = new Amort(nz(r.firstPrincipal), nz(r.firstRateAnnual),
        nzInt(r.firstAmortYears, 30), nzInt(r.firstInterestOnlyYears, 0));
    Amort secondMortgage = nz(r.secondPrincipal) > 0
        ? new Amort(nz(r.secondPrincipal), nz(r.secondRateAnnual), nzInt(r.secondAmortYears, 20), 0)
        : null;
    
    // Convert monthly financing costs to annual
    double otherFinancingCostsAnnual = nz(r.otherMonthlyFinancingCosts) * 12;

    // Calculate total annual debt service for Year 1
    double annualDebtServiceY1 = firstMortgage.annualDebtService(1)
        + (secondMortgage != null ? secondMortgage.annualDebtService(1) : 0) + otherFinancingCostsAnnual;
    
    // Debt Service Coverage Ratio = NOI / Annual Debt Service
    Double debtServiceCoverageRatioY1 = annualDebtServiceY1 > 0 
        ? netOperatingIncomeY1 / annualDebtServiceY1 : null;

    // Real Purchase Price = Offer Price + All Closing Costs and Repairs
    double realPurchasePrice = nz(r.offerPrice) + sum(r.repairs, r.repairsContingency, r.lenderFee, r.brokerFee,
        r.environmentals, r.inspections, r.appraisals, r.transferTax, r.legalClose, r.otherClosingCosts);
    
    // Cash to Close = Real Purchase Price - All Loan Amounts
    double cashToClose = realPurchasePrice - nz(r.firstPrincipal) - nz(r.secondPrincipal);

    // Calculate Year 1 key performance indicators
    // Cap Rate based on Purchase Price
    Double capRatePurchasePriceY1 = nz(r.offerPrice) > 0 
        ? netOperatingIncomeY1 / r.offerPrice : null;
    
    // Cap Rate based on Fair Market Value
    Double capRateFairMarketValueY1 = nz(r.fmv) > 0 
        ? netOperatingIncomeY1 / r.fmv : null;
    
    // Monthly cash flow after debt service
    double monthlyCashFlowY1 = (netOperatingIncomeY1 - annualDebtServiceY1) / 12.0;
    
    // Average rent per unit per month
    Double averageRentPerUnitY1 = (nzInt(r.numberOfUnits, 0) > 0 && nz(r.grossRentsAnnual) > 0)
        ? (r.grossRentsAnnual / 12.0 / r.numberOfUnits) : null;
    
    // Cash flow per unit per month
    Double cashFlowPerUnitPerMonthY1 = (nzInt(r.numberOfUnits, 0) > 0) 
        ? monthlyCashFlowY1 / r.numberOfUnits : null;
    
    // Gross Rent Multiplier = Purchase Price / Annual Gross Rents
    Double grossRentMultiplierY1 = nz(r.grossRentsAnnual) > 0 
        ? nz(r.offerPrice) / r.grossRentsAnnual : null;
    
    // Loan to Value ratio based on Fair Market Value
    Double loanToValueFMV = nz(r.fmv) > 0 
        ? nz(r.firstPrincipal) / r.fmv : null;
    
    // Loan to Purchase Price ratio
    Double loanToPurchasePrice = nz(r.offerPrice) > 0 
        ? nz(r.firstPrincipal) / r.offerPrice : null;

    // Cash on Cash Return = (NOI - Debt Service) / Cash to Close
    Double cashOnCashReturnY1 = cashToClose > 0 
        ? (netOperatingIncomeY1 - annualDebtServiceY1) / cashToClose : null;
    
    // Equity ROI from principal paydown in Year 1
    Double equityROIY1 = cashToClose > 0
        ? (firstMortgage.principalPaidYear(1) + (secondMortgage != null ? secondMortgage.principalPaidYear(1) : 0)) / cashToClose
        : null;
    
    // Appreciation ROI from property value increase in Year 1
    Double appreciationROIY1 = (cashToClose > 0 && nz(r.fmv) > 0)
        ? (r.fmv * nz(r.annualAppreciation)) / cashToClose : null;
    
    // Total ROI = Cash on Cash + Equity ROI + Appreciation ROI
    Double totalROIY1 = sum(cashOnCashReturnY1, equityROIY1, appreciationROIY1);
    
    // Forced Appreciation ROI = (FMV - RPP) / Cash to Close
    Double forcedAppreciationROIY1 = cashToClose > 0 
        ? (nz(r.fmv) - realPurchasePrice) / cashToClose : null;

    // Build response object with all calculated metrics
    CashflowResponse response = new CashflowResponse();
    response.summary = new CashflowResponse.Summary();
    
    // Set pricing and cash metrics
    response.summary.rpp = realPurchasePrice;
    response.summary.cashToClose = cashToClose;
    
    // Set Year 1 income and expense metrics
    response.summary.totalIncomeY1 = totalIncomeY1;
    response.summary.vacancyLossY1 = vacancyLossY1;
    response.summary.egiY1 = effectiveGrossIncomeY1;
    response.summary.totalExpensesY1 = totalExpensesY1;
    response.summary.noiY1 = netOperatingIncomeY1;
    
    // Set debt service metrics
    response.summary.annualDebtServiceY1 = annualDebtServiceY1;
    response.summary.dscrY1 = debtServiceCoverageRatioY1;
    
    // Set cap rates and market multiples
    response.summary.capRatePPY1 = capRatePurchasePriceY1;
    response.summary.capRateFMVY1 = capRateFairMarketValueY1;
    response.summary.grmY1 = grossRentMultiplierY1;
    response.summary.avgRentPerUnitY1 = averageRentPerUnitY1;
    response.summary.monthlyProfitY1 = monthlyCashFlowY1;
    response.summary.cashflowPerUnitPerMonthY1 = cashFlowPerUnitPerMonthY1;
    
    // Set leverage ratios
    response.summary.ltvFMV = loanToValueFMV;
    response.summary.ltppPP = loanToPurchasePrice;
    
    // Set return metrics
    response.summary.cashOnCashY1 = cashOnCashReturnY1;
    response.summary.equityROIY1 = equityROIY1;
    response.summary.appreciationROIY1 = appreciationROIY1;
    response.summary.totalROIY1 = totalROIY1;
    response.summary.forcedAppreciationROIY1 = forcedAppreciationROIY1;

    // Build multi-year projection and calculate exit proceeds
    response.projection = new ArrayList<>();
    double propertyValue;
    double firstMortgageBalance;
    double secondMortgageBalance;
    
    // Initialize cash flow list with negative cash to close (initial investment)
    List<Double> cashFlows = new ArrayList<>();
    cashFlows.add(-cashToClose);

    // Project each year of the holding period
    for (int year = 1; year <= holdYears; year++) {
      // Calculate income for this year with growth applied
      double totalIncome = (nz(r.grossRentsAnnual) + nz(r.parkingAnnual) + nz(r.storageAnnual)
          + nz(r.laundryVendingAnnual) + nz(r.otherIncomeAnnual)) * Math.pow(1 + rentGrowthRate, year - 1);
      
      double vacancyLoss = totalIncome * nz(r.vacancyRate) * -1.0;
      double effectiveGrossIncome = totalIncome + vacancyLoss;

      // Calculate expenses with growth
      // Management base grows with income if based on Gross Rents, otherwise uses EGI
      double managementBase = "GROSS_RENTS".equalsIgnoreCase(r.managementBase)
          ? nz(r.grossRentsAnnual) * Math.pow(1 + rentGrowthRate, year - 1) : effectiveGrossIncome;
      double managementFee = nz(r.managementRate) * Math.max(0, managementBase);
      
      // Repairs expense grows with gross rents
      double repairsExpense = nz(r.repairsRate) * nz(r.grossRentsAnnual) * Math.pow(1 + rentGrowthRate, year - 1);
      
      // Other operating expenses grow by expense growth rate
      double otherOperatingExpenses = otherOperatingExpensesY1 * Math.pow(1 + expenseGrowthRate, year - 1);

      double totalExpenses = managementFee + repairsExpense + otherOperatingExpenses;
      double netOperatingIncome = effectiveGrossIncome - totalExpenses;

      // Calculate debt service for this year
      double debtService = firstMortgage.annualDebtService(year) 
          + (secondMortgage != null ? secondMortgage.annualDebtService(year) : 0) 
          + otherFinancingCostsAnnual;
      
      // Get ending loan balances
      firstMortgageBalance = firstMortgage.balanceEndOfYear(year);
      secondMortgageBalance = (secondMortgage != null ? secondMortgage.balanceEndOfYear(year) : 0);

      // Calculate property value with appreciation
      propertyValue = nz(r.offerPrice) * Math.pow(1 + appreciationRate, year);

      // Create projection row for this year
      CashflowResponse.YearRow yearRow = new CashflowResponse.YearRow();
      yearRow.year = year;
      yearRow.totalIncome = totalIncome;
      yearRow.vacancyLoss = vacancyLoss;
      yearRow.egi = effectiveGrossIncome;
      yearRow.management = managementFee;
      yearRow.repairsRateBased = repairsExpense;
      yearRow.totalExpenses = totalExpenses;
      yearRow.noi = netOperatingIncome;
      yearRow.debtService = debtService;
      yearRow.cashFlowBeforeTax = netOperatingIncome - debtService;
      yearRow.endingBalanceFirst = firstMortgageBalance;
      yearRow.endingBalanceSecond = secondMortgageBalance;
      yearRow.propertyValue = propertyValue;
      response.projection.add(yearRow);

      // Add cash flow to list (for IRR calculation)
      if (year < holdYears) {
        // Regular year: add cash flow before tax
        cashFlows.add(yearRow.cashFlowBeforeTax);
      } else {
        // Final year: add cash flow plus net sale proceeds
        double saleCosts = propertyValue * exitCostRate;
        double netSaleProceeds = propertyValue - saleCosts - (firstMortgageBalance + secondMortgageBalance);
        response.summary.saleProceedsNet = netSaleProceeds;
        cashFlows.add(yearRow.cashFlowBeforeTax + netSaleProceeds);
      }
    }

    // Calculate equity multiple: total positive cash flows / initial investment
    response.summary.equityMultiple = sumPos(cashFlows) / -cashFlows.get(0);
    
    // Calculate Internal Rate of Return using Newton-Raphson method
    response.summary.irr = irr(cashFlows, 0.10);
    
    return response;
  }

  /**
   * Amortization helper class for calculating mortgage payments and balances.
   * Handles interest-only periods and standard amortization.
   */
  static class Amort {
    final double principal;           // Loan principal amount
    final double annualRate;           // Annual interest rate as fraction (e.g., 0.0675 for 6.75%)
    final int totalYears;              // Total amortization term in years
    final int interestOnlyYears;      // Number of initial years that are interest-only

    /**
     * Creates a new amortization schedule.
     * 
     * @param principal The loan principal amount
     * @param rate Annual interest rate as fraction
     * @param years Total amortization term in years
     * @param ioYears Number of interest-only years at the start
     */
    Amort(double principal, double rate, int years, int ioYears) {
      this.principal = principal;
      this.annualRate = rate;
      this.totalYears = years;
      this.interestOnlyYears = Math.min(ioYears, years);
    }

    /**
     * Calculates the total annual payment (principal + interest) for a given year.
     * During interest-only period, returns only interest payment.
     * 
     * @param year The year number (1-based)
     * @return Annual debt service payment
     */
    double annualDebtService(int year) {
      if (principal <= 0) return 0.0;
      
      // During interest-only period, payment is just interest
      if (year <= interestOnlyYears) return principal * annualRate;
      
      // Calculate amortizing payment for remaining term
      int remainingYears = totalYears - interestOnlyYears;
      if (annualRate == 0) return principal / remainingYears;
      
      // Standard amortization formula: P * r / (1 - (1+r)^-n)
      double payment = (principal * annualRate) / (1 - Math.pow(1 + annualRate, -remainingYears));
      return payment;
    }

    /**
     * Calculates the loan balance at the end of a given year.
     * 
     * @param year The year number (1-based)
     * @return Ending loan balance
     */
    double balanceEndOfYear(int year) {
      if (principal <= 0) return 0.0;
      
      // During interest-only period, balance remains at principal
      if (year <= interestOnlyYears) return principal;
      
      // Calculate balance after interest-only period
      int yearsIntoAmortization = year - interestOnlyYears;
      int remainingYears = totalYears - interestOnlyYears;
      
      if (annualRate == 0) {
        // Simple linear paydown for zero interest
        return Math.max(0, principal - (principal / remainingYears) * yearsIntoAmortization);
      }
      
      // Standard amortization balance formula
      double payment = (principal * annualRate) / (1 - Math.pow(1 + annualRate, -remainingYears));
      double balance = principal * Math.pow(1 + annualRate, yearsIntoAmortization) 
          - payment * ((Math.pow(1 + annualRate, yearsIntoAmortization) - 1) / annualRate);
      return Math.max(0, balance);
    }

    /**
     * Calculates the principal amount paid down during a specific year.
     * Returns zero during interest-only period.
     * 
     * @param year The year number (1-based)
     * @return Principal paid during this year
     */
    double principalPaidYear(int year) {
      if (year <= interestOnlyYears || principal <= 0) return 0.0;
      
      double balanceAtStart = balanceEndOfYear(year - 1);
      double balanceAtEnd = balanceEndOfYear(year);
      return Math.max(0, balanceAtStart - balanceAtEnd);
    }
  }

  // Utility methods for handling null values and calculations
  
  
  // Converts null Double to 0.0, otherwise returns the value.
   
  private static double nz(Double value) {
    return value == null ? 0.0 : value;
  }
  
  
   // Converts null Integer to default value, otherwise returns the value.
  
  private static int nzInt(Integer value, int defaultValue) {
    return value == null ? defaultValue : value;
  }
  
  
   // Sums all provided Double values, treating null as zero.
   
  private static double sum(Double... values) {
    double sum = 0;
    for (Double value : values) {
      sum += nz(value);
    }
    return sum;
  }
  
  
  //  Sums only positive values from a list.
   
  private static double sumPos(List<Double> values) {
    double sum = 0;
    for (double value : values) {
      if (value > 0) {
        sum += value;
      }
    }
    return sum;
  }

  /**
   * Calculates Internal Rate of Return using Newton-Raphson method.
   * The first cash flow should be negative (initial investment).
   * 
   * @param cashFlows List of cash flows (yearly periods)
   * @param initialGuess Initial guess for IRR (typically 0.10 for 10%)
   * @return Calculated IRR, or null if convergence fails
   */
  private static Double irr(List<Double> cashFlows, double initialGuess) {
    double currentRate = initialGuess;
    
    // Newton-Raphson iteration (max 50 iterations)
    for (int iteration = 0; iteration < 50; iteration++) {
      double netPresentValue = 0;
      double netPresentValueDerivative = 0;
      
      // Calculate NPV and its derivative
      for (int period = 0; period < cashFlows.size(); period++) {
        double cashFlow = cashFlows.get(period);
        double discountFactor = Math.pow(1 + currentRate, period);
        netPresentValue += cashFlow / discountFactor;
        
        // Derivative calculation (skip period 0 as it has no time component)
        if (period > 0) {
          netPresentValueDerivative += -period * cashFlow / Math.pow(1 + currentRate, period + 1);
        }
      }
      
      // Newton-Raphson step: x_new = x_old - f(x) / f'(x)
      double newRate = currentRate - netPresentValue / netPresentValueDerivative;
      
      // Check for invalid values
      if (Double.isNaN(newRate) || Double.isInfinite(newRate)) {
        break;
      }
      
      // Check for convergence
      if (Math.abs(newRate - currentRate) < 1e-7) {
        return newRate;
      }
      
      currentRate = newRate;
    }
    
    // Convergence failed
    return null;
  }
}
