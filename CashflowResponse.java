package com.example.analysis.dto;

import java.util.List;

/** Output DTO for investment cashflow analysis. */
public class CashflowResponse {
  public Summary summary;            // One-shot key metrics
  public List<YearRow> projection;   // Year-by-year projection

  /** Aggregated metrics and single-number KPIs. */
  public static class Summary {
    // Pricing & cash required
    public Double rpp;               // Real Purchase Price (offer + closing/rehab)
    public Double cashToClose;       // Cash required at closing (RPP minus loans)

    // Year-1 income/expense stack
    public Double totalIncomeY1; public Double vacancyLossY1;
    public Double egiY1; public Double totalExpensesY1; public Double noiY1;

    // Year-1 debt & protection ratios
    public Double annualDebtServiceY1; public Double dscrY1;

    // Year-1 profitability and market multiples
    public Double capRatePPY1;       // Cap rate on purchase price
    public Double capRateFMVY1;      // Cap rate on FMV
    public Double grmY1;             // Gross Rent Multiplier (PP / Gross Rents)
    public Double avgRentPerUnitY1;  // Average rent per unit per month
    public Double monthlyProfitY1;   // (NOI - Debt Service) / 12
    public Double cashflowPerUnitPerMonthY1;

    // Leverage & returns
    public Double ltvFMV;            // LTV vs FMV (1st loan)
    public Double ltppPP;            // LTPP vs purchase price (1st loan)
    public Double cashOnCashY1;      // CoC (Year 1)
    public Double equityROIY1;       // Equity (principal pay-down) / Cash to close
    public Double appreciationROIY1; // Appreciation / Cash to close
    public Double totalROIY1;        // CoC + Equity ROI + Appreciation ROI
    public Double forcedAppreciationROIY1; // (FMV - RPP) / Cash to close

    // Exit / multi-year
    public Double irr;               // Project IRR over holding period
    public Double equityMultiple;    // (Total distributions) / (Total invested)
    public Double saleProceedsNet;   // Net sale proceeds at exit
  }

  /** One projection row per year. */
  public static class YearRow {
    public int year;
    public Double totalIncome, vacancyLoss, egi;
    public Double management, repairsRateBased, totalExpenses, noi;
    public Double debtService, cashFlowBeforeTax;
    public Double endingBalanceFirst, endingBalanceSecond;
    public Double propertyValue;
  }
}
