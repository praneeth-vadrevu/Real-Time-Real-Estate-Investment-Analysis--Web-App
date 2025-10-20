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

  /** Run the analysis and produce summary + yearly projection. */
  public CashflowResponse analyze(CashflowRequest r) {
    // --- Defaults & convenience values ---
    int hold = nzInt(r.holdYears, 10);
    double rentGrowth = nz(r.rentGrowth), expGrowth = nz(r.expenseGrowth);
    double appr = nz(r.annualAppreciation), exitRate = nz(r.exitCostRate);

    // --- Year-1 income stack ---
    double totalIncomeY1 = nz(r.grossRentsAnnual) + nz(r.parkingAnnual) + nz(r.storageAnnual)
        + nz(r.laundryVendingAnnual) + nz(r.otherIncomeAnnual);
    double vacancyLossY1 = totalIncomeY1 * nz(r.vacancyRate) * -1.0;
    double egiY1 = totalIncomeY1 + vacancyLossY1;

    // Management base: by default EGI; optionally Gross Rents
    double mgmtBaseY1 = "GROSS_RENTS".equalsIgnoreCase(r.managementBase)
        ? nz(r.grossRentsAnnual) : egiY1;
    double managementY1 = nz(r.managementRate) * Math.max(0, mgmtBaseY1);

    // Repairs rate is applied to gross rents
    double repairsRateBasedY1 = nz(r.repairsRate) * nz(r.grossRentsAnnual);

    // Flat (amount-based) annual operating expenses
    double otherOpexY1 = sum(
      r.propertyTaxes, r.insurance, r.electricity, r.gas, r.waterSewer, r.cable,
      r.caretaking, r.advertising, r.associationFees, r.pest, r.security, r.trash, r.misc,
      r.commonAreaMaintenance, r.capitalImprovements, r.accounting, r.legal, r.badDebts,
      r.evictions, r.otherExpenses
    );
    double totalExpensesY1 = managementY1 + repairsRateBasedY1 + otherOpexY1;
    double noiY1 = egiY1 - totalExpensesY1;

    // --- Financing & debt service ---
    Amort first = new Amort(nz(r.firstPrincipal), nz(r.firstRateAnnual),
        nzInt(r.firstAmortYears, 30), nzInt(r.firstInterestOnlyYears, 0));
    Amort second = nz(r.secondPrincipal) > 0
        ? new Amort(nz(r.secondPrincipal), nz(r.secondRateAnnual), nzInt(r.secondAmortYears, 20), 0)
        : null;
    double otherFinAnnual = nz(r.otherMonthlyFinancingCosts) * 12;

    double annualDebtServiceY1 = first.annualDebtService(1)
        + (second != null ? second.annualDebtService(1) : 0) + otherFinAnnual;
    Double dscrY1 = annualDebtServiceY1 > 0 ? noiY1 / annualDebtServiceY1 : null;

    // --- Real Purchase Price (RPP) and cash to close ---
    double rpp = nz(r.offerPrice) + sum(r.repairs, r.repairsContingency, r.lenderFee, r.brokerFee,
        r.environmentals, r.inspections, r.appraisals, r.transferTax, r.legalClose, r.otherClosingCosts);
    double cashToClose = rpp - nz(r.firstPrincipal) - nz(r.secondPrincipal);

    // --- Year-1 KPIs ---
    Double capRatePPY1  = nz(r.offerPrice) > 0 ? noiY1 / r.offerPrice : null;
    Double capRateFMVY1 = nz(r.fmv) > 0 ? noiY1 / r.fmv : null;
    double monthlyProfitY1 = (noiY1 - annualDebtServiceY1) / 12.0;
    Double avgRentPerUnitY1 = (nzInt(r.numberOfUnits, 0) > 0 && nz(r.grossRentsAnnual) > 0)
        ? (r.grossRentsAnnual / 12.0 / r.numberOfUnits) : null;
    Double cfPerUnitPerMonthY1 = (nzInt(r.numberOfUnits, 0) > 0) ? monthlyProfitY1 / r.numberOfUnits : null;
    Double grmY1 = nz(r.grossRentsAnnual) > 0 ? nz(r.offerPrice) / r.grossRentsAnnual : null;
    Double ltvFMV = nz(r.fmv) > 0 ? nz(r.firstPrincipal) / r.fmv : null;
    Double ltppPP = nz(r.offerPrice) > 0 ? nz(r.firstPrincipal) / r.offerPrice : null;

    Double cocY1 = cashToClose > 0 ? (noiY1 - annualDebtServiceY1) / cashToClose : null;
    Double equityROIY1 = cashToClose > 0
        ? (first.principalPaidYear(1) + (second != null ? second.principalPaidYear(1) : 0)) / cashToClose
        : null;
    Double appreciationROIY1 = (cashToClose > 0 && nz(r.fmv) > 0)
        ? (r.fmv * nz(r.annualAppreciation)) / cashToClose : null;
    Double totalROIY1 = sum(cocY1, equityROIY1, appreciationROIY1);
    Double forcedAppROIY1 = cashToClose > 0 ? (nz(r.fmv) - rpp) / cashToClose : null;

    // --- Build response summary ---
    CashflowResponse out = new CashflowResponse();
    out.summary = new CashflowResponse.Summary();
    out.summary.rpp = rpp; out.summary.cashToClose = cashToClose;
    out.summary.totalIncomeY1 = totalIncomeY1; out.summary.vacancyLossY1 = vacancyLossY1;
    out.summary.egiY1 = egiY1; out.summary.totalExpensesY1 = totalExpensesY1; out.summary.noiY1 = noiY1;
    out.summary.annualDebtServiceY1 = annualDebtServiceY1; out.summary.dscrY1 = dscrY1;
    out.summary.capRatePPY1 = capRatePPY1; out.summary.capRateFMVY1 = capRateFMVY1;
    out.summary.grmY1 = grmY1; out.summary.avgRentPerUnitY1 = avgRentPerUnitY1;
    out.summary.monthlyProfitY1 = monthlyProfitY1; out.summary.cashflowPerUnitPerMonthY1 = cfPerUnitPerMonthY1;
    out.summary.ltvFMV = ltvFMV; out.summary.ltppPP = ltppPP;
    out.summary.cashOnCashY1 = cocY1; out.summary.equityROIY1 = equityROIY1;
    out.summary.appreciationROIY1 = appreciationROIY1; out.summary.totalROIY1 = totalROIY1;
    out.summary.forcedAppreciationROIY1 = forcedAppROIY1;

    // --- Multi-year projection & exit ---
    out.projection = new ArrayList<>();
    double pv; double bal1; double bal2;
    List<Double> cash = new ArrayList<>(); cash.add(-cashToClose);

    for (int y = 1; y <= hold; y++) {
      double totalIncome = (nz(r.grossRentsAnnual) + nz(r.parkingAnnual) + nz(r.storageAnnual)
          + nz(r.laundryVendingAnnual) + nz(r.otherIncomeAnnual)) * Math.pow(1 + rentGrowth, y - 1);
      double vacancy = totalIncome * nz(r.vacancyRate) * -1.0;
      double egi = totalIncome + vacancy;

      // Grow expenses: amount-based block grows by expenseGrowth; management/repairs are rule-based
      double mgmtBase = "GROSS_RENTS".equalsIgnoreCase(r.managementBase)
          ? nz(r.grossRentsAnnual) * Math.pow(1 + rentGrowth, y - 1) : egi;
      double mgmt = nz(r.managementRate) * Math.max(0, mgmtBase);
      double repairsRateBased = nz(r.repairsRate) * nz(r.grossRentsAnnual) * Math.pow(1 + rentGrowth, y - 1);
      double otherOpex = otherOpexY1 * Math.pow(1 + expGrowth, y - 1);

      double totalExp = mgmt + repairsRateBased + otherOpex;
      double noi = egi - totalExp;

      double ds = first.annualDebtService(y) + (second != null ? second.annualDebtService(y) : 0) + otherFinAnnual;
      bal1 = first.balanceEndOfYear(y); bal2 = (second != null ? second.balanceEndOfYear(y) : 0);

      pv = nz(r.offerPrice) * Math.pow(1 + appr, y);

      CashflowResponse.YearRow row = new CashflowResponse.YearRow();
      row.year = y;
      row.totalIncome = totalIncome; row.vacancyLoss = vacancy; row.egi = egi;
      row.management = mgmt; row.repairsRateBased = repairsRateBased; row.totalExpenses = totalExp;
      row.noi = noi; row.debtService = ds; row.cashFlowBeforeTax = noi - ds;
      row.endingBalanceFirst = bal1; row.endingBalanceSecond = bal2; row.propertyValue = pv;
      out.projection.add(row);

      if (y < hold) cash.add(row.cashFlowBeforeTax);
      else {
        double saleCosts = pv * exitRate;
        double netSale = pv - saleCosts - (bal1 + bal2);
        out.summary.saleProceedsNet = netSale;
        cash.add(row.cashFlowBeforeTax + netSale);
      }
    }

    out.summary.equityMultiple = sumPos(cash) / -cash.get(0);
    out.summary.irr = irr(cash, 0.10); // 10% initial guess
    return out;
  }

  // ---------- Amortization helper (annual) ----------
  static class Amort {
    final double P;        // principal
    final double r;        // APR (as fraction)
    final int nYears;      // total term (years)
    final int ioYears;     // initial interest-only years

    Amort(double principal, double rate, int years, int ioYears) {
      this.P = principal; this.r = rate; this.nYears = years; this.ioYears = Math.min(ioYears, years);
    }

    /** Total annual payment (principal + interest). During IO, this is interest only. */
    double annualDebtService(int year) {
      if (P <= 0) return 0.0;
      if (year <= ioYears) return P * r;
      int remaining = nYears - ioYears;
      if (r == 0) return P / remaining;
      double a = (P * r) / (1 - Math.pow(1 + r, -remaining));
      return a;
    }

    /** Ending balance after `year` (year granularity). */
    double balanceEndOfYear(int year) {
      if (P <= 0) return 0.0;
      if (year <= ioYears) return P;
      int k = year - ioYears; int remaining = nYears - ioYears;
      if (r == 0) return Math.max(0, P - (P / remaining) * k);
      double a = (P * r) / (1 - Math.pow(1 + r, -remaining));
      double bal = P * Math.pow(1 + r, k) - a * ((Math.pow(1 + r, k) - 1) / r);
      return Math.max(0, bal);
    }

    /** Principal reduction during a specific year (zero during IO). */
    double principalPaidYear(int year) {
      if (year <= ioYears || P <= 0) return 0.0;
      double start = balanceEndOfYear(year - 1);
      double end   = balanceEndOfYear(year);
      return Math.max(0, start - end);
    }
  }

  // ---------- Utilities ----------
  private static double nz(Double d){ return d == null ? 0.0 : d; }
  private static int nzInt(Integer i, int def){ return i == null ? def : i; }
  private static double sum(Double... xs){ double s=0; for (Double x: xs) s += nz(x); return s; }
  private static double sumPos(List<Double> v){ double s=0; for (double x: v) if (x>0) s+=x; return s; }

  /** Newton–Raphson IRR (cash[0] negative; yearly periods). Returns null if not converged. */
  private static Double irr(List<Double> cash, double guess) {
    double x = guess;
    for (int i = 0; i < 50; i++) {
      double f = 0, df = 0;
      for (int t = 0; t < cash.size(); t++) {
        double ct = cash.get(t), d = Math.pow(1 + x, t);
        f += ct / d;
        if (t > 0) df += -t * ct / Math.pow(1 + x, t + 1);
      }
      double x1 = x - f / df;
      if (Double.isNaN(x1) || Double.isInfinite(x1)) break;
      if (Math.abs(x1 - x) < 1e-7) return x1;
      x = x1;
    }
    return null;
  }
}
