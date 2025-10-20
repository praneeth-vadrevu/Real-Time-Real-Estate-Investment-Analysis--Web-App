package com.example.analysis.service;

import com.example.analysis.dto.CashflowRequest;
import com.example.analysis.dto.CashflowResponse;

/**
 * Test Suite for Cashflow Analysis Calculator
 * Validates core functionality including income calculations, expense calculations,
 * debt service, capitalization rates, and return on investment metrics.
 */
public class CashflowServiceTest {

    public static void main(String[] args) {
        CashflowServiceTest test = new CashflowServiceTest();
        
        System.out.println("====================================");
        System.out.println("  Cashflow Analysis Calculator");
        System.out.println("  Comprehensive Test Suite");
        System.out.println("====================================\n");
        
        int passed = 0;
        int total = 0;
        
        // Test 1: Basic Income and NOI Calculation
        total++;
        System.out.println("\n--- TEST 1: Basic Income and NOI Calculation ---");
        if (test.testBasicIncomeAndNOI()) {
            passed++;
            System.out.println("✓ PASSED: Basic Income and NOI Calculation");
        } else {
            System.out.println("✗ FAILED: Basic Income and NOI Calculation");
        }
        
        // Test 2: Debt Service and DSCR Calculation
        total++;
        System.out.println("\n--- TEST 2: Debt Service and DSCR Calculation ---");
        if (test.testDebtServiceAndDSCR()) {
            passed++;
            System.out.println("✓ PASSED: Debt Service and DSCR Calculation");
        } else {
            System.out.println("✗ FAILED: Debt Service and DSCR Calculation");
        }
        
        // Test 3: Cap Rate Calculation
        total++;
        System.out.println("\n--- TEST 3: Cap Rate Calculation ---");
        if (test.testCapRates()) {
            passed++;
            System.out.println("✓ PASSED: Cap Rate Calculation");
        } else {
            System.out.println("✗ FAILED: Cap Rate Calculation");
        }
        
        // Test 4: Cash-on-Cash Return and ROI
        total++;
        System.out.println("\n--- TEST 4: Cash-on-Cash Return and ROI ---");
        if (test.testCashOnCashAndROI()) {
            passed++;
            System.out.println("✓ PASSED: Cash-on-Cash Return and ROI");
        } else {
            System.out.println("✗ FAILED: Cash-on-Cash Return and ROI");
        }
        
        // Test 5: Multi-Year Projection
        total++;
        System.out.println("\n--- TEST 5: Multi-Year Projection ---");
        if (test.testMultiYearProjection()) {
            passed++;
            System.out.println("✓ PASSED: Multi-Year Projection");
        } else {
            System.out.println("✗ FAILED: Multi-Year Projection");
        }
        
        // Test 6: Complete Real-World Scenario
        total++;
        System.out.println("\n--- TEST 6: Complete Real-World Scenario ---");
        if (test.testCompleteScenario()) {
            passed++;
            System.out.println("✓ PASSED: Complete Real-World Scenario");
        } else {
            System.out.println("✗ FAILED: Complete Real-World Scenario");
        }
        
        // Test 7: Interest-Only Period
        total++;
        System.out.println("\n--- TEST 7: Interest-Only Period ---");
        if (test.testInterestOnlyPeriod()) {
            passed++;
            System.out.println("✓ PASSED: Interest-Only Period");
        } else {
            System.out.println("✗ FAILED: Interest-Only Period");
        }
        
        System.out.println("\n====================================");
        System.out.println("TEST RESULTS: " + passed + "/" + total + " PASSED");
        System.out.println("Success Rate: " + String.format("%.1f%%", (passed * 100.0 / total)));
        System.out.println("====================================");
        
        if (passed == total) {
            System.out.println("\n🎉 All tests passed! The calculator is ready for production.");
        } else {
            System.out.println("\n⚠️  Some tests failed. Please review the output above.");
        }
        
        System.exit(passed == total ? 0 : 1);
    }
    
    /**
     * Test 1: Basic Income and Net Operating Income (NOI) Calculation
     */
    public boolean testBasicIncomeAndNOI() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // Set basic income streams
        req.grossRentsAnnual = 120000.0;  // Annual rent income
        req.parkingAnnual = 6000.0;       // Parking income
        req.storageAnnual = 2400.0;       // Storage income
        req.vacancyRate = 0.05;           // 5% vacancy rate
        
        // Set expenses
        req.managementRate = 0.10;        // 10% management fee
        req.propertyTaxes = 15000.0;      // Property taxes
        req.insurance = 3000.0;           // Insurance
        
        CashflowResponse resp = service.analyze(req);
        
        // Verify total income = rent + parking + storage
        double expectedTotalIncome = 120000 + 6000 + 2400; // = 128,400
        System.out.println("  Total Income: $" + String.format("%,.2f", resp.summary.totalIncomeY1) + 
                          " (Expected: $" + String.format("%,.2f", expectedTotalIncome) + ")");
        if (!approxEqual(resp.summary.totalIncomeY1, expectedTotalIncome)) {
            System.out.println("  ERROR: Total income mismatch!");
            return false;
        }
        
        // Verify vacancy loss = total income * vacancy rate (negative)
        double expectedVacancyLoss = -128400 * 0.05; // = -6,420
        System.out.println("  Vacancy Loss: $" + String.format("%,.2f", resp.summary.vacancyLossY1) + 
                          " (Expected: $" + String.format("%,.2f", expectedVacancyLoss) + ")");
        if (!approxEqual(resp.summary.vacancyLossY1, expectedVacancyLoss)) {
            System.out.println("  ERROR: Vacancy loss mismatch!");
            return false;
        }
        
        // Verify Effective Gross Income (EGI) = total income + vacancy loss
        double expectedEGI = 128400 - 6420; // = 121,980
        System.out.println("  Effective Gross Income: $" + String.format("%,.2f", resp.summary.egiY1) + 
                          " (Expected: $" + String.format("%,.2f", expectedEGI) + ")");
        if (!approxEqual(resp.summary.egiY1, expectedEGI)) {
            System.out.println("  ERROR: EGI mismatch!");
            return false;
        }
        
        // Verify NOI (without debt)
        double expectedNOI = expectedEGI - (expectedEGI * 0.10) - 15000 - 3000;
        System.out.println("  Net Operating Income: $" + String.format("%,.2f", resp.summary.noiY1) + 
                          " (Expected: $" + String.format("%,.2f", expectedNOI) + ")");
        if (!approxEqual(resp.summary.noiY1, expectedNOI)) {
            System.out.println("  ERROR: NOI mismatch!");
            return false;
        }
        
        return true;
    }
    
    /**
     * Test 2: Debt Service and Debt Service Coverage Ratio (DSCR) Calculation
     */
    public boolean testDebtServiceAndDSCR() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // Set income
        req.grossRentsAnnual = 100000.0;
        req.vacancyRate = 0.05;
        
        // Set expenses (simple scenario)
        req.managementRate = 0.08;
        req.propertyTaxes = 10000.0;
        req.insurance = 2000.0;
        
        // Set loan
        req.firstPrincipal = 1000000.0;   // $1M loan
        req.firstRateAnnual = 0.05;       // 5% APR
        req.firstAmortYears = 30;         // 30-year amortization
        req.firstInterestOnlyYears = 0;   // No interest-only period
        
        CashflowResponse resp = service.analyze(req);
        
        // Verify annual debt service exists and is positive
        System.out.println("  Annual Debt Service: $" + String.format("%,.2f", resp.summary.annualDebtServiceY1));
        if (resp.summary.annualDebtServiceY1 == null || resp.summary.annualDebtServiceY1 <= 0) {
            System.out.println("  ERROR: Annual debt service should be positive!");
            return false;
        }
        
        // Verify DSCR = NOI / Annual Debt Service
        double expectedDSCR = resp.summary.noiY1 / resp.summary.annualDebtServiceY1;
        System.out.println("  DSCR: " + String.format("%.3f", resp.summary.dscrY1) + 
                          " (Expected: " + String.format("%.3f", expectedDSCR) + ")");
        if (!approxEqual(resp.summary.dscrY1, expectedDSCR)) {
            System.out.println("  ERROR: DSCR mismatch!");
            return false;
        }
        
        // DSCR should be > 1.0 for healthy investment
        if (resp.summary.dscrY1 < 1.0) {
            System.out.println("  WARNING: DSCR < 1.0 may indicate risky investment");
        } else {
            System.out.println("  ✓ Healthy DSCR (>1.0)");
        }
        
        return true;
    }
    
    /**
     * Test 3: Capitalization Rate (Cap Rate) Calculation
     */
    public boolean testCapRates() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // Set property values
        req.fmv = 1500000.0;              // Fair Market Value $1.5M
        req.offerPrice = 1400000.0;       // Offer Price $1.4M
        
        // Set income
        req.grossRentsAnnual = 120000.0;
        req.vacancyRate = 0.05;
        req.managementRate = 0.08;
        req.propertyTaxes = 18000.0;
        req.insurance = 3000.0;
        
        CashflowResponse resp = service.analyze(req);
        
        // Verify cap rate based on purchase price
        double expectedCapRatePP = resp.summary.noiY1 / req.offerPrice;
        System.out.println("  Cap Rate (Purchase Price): " + String.format("%.2f%%", resp.summary.capRatePPY1 * 100) + 
                          " (Expected: " + String.format("%.2f%%", expectedCapRatePP * 100) + ")");
        if (!approxEqual(resp.summary.capRatePPY1, expectedCapRatePP)) {
            System.out.println("  ERROR: Cap Rate (PP) mismatch!");
            return false;
        }
        
        // Verify cap rate based on FMV
        double expectedCapRateFMV = resp.summary.noiY1 / req.fmv;
        System.out.println("  Cap Rate (Fair Market Value): " + String.format("%.2f%%", resp.summary.capRateFMVY1 * 100) + 
                          " (Expected: " + String.format("%.2f%%", expectedCapRateFMV * 100) + ")");
        if (!approxEqual(resp.summary.capRateFMVY1, expectedCapRateFMV)) {
            System.out.println("  ERROR: Cap Rate (FMV) mismatch!");
            return false;
        }
        
        // Cap Rate should be in reasonable range (typically 3%-10%)
        if (resp.summary.capRatePPY1 < 0.03 || resp.summary.capRatePPY1 > 0.15) {
            System.out.println("  WARNING: Cap Rate outside typical range (3%-10%)");
        } else {
            System.out.println("  ✓ Cap Rate within typical range");
        }
        
        return true;
    }
    
    /**
     * Test 4: Cash-on-Cash Return and ROI Metrics
     */
    public boolean testCashOnCashAndROI() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // Set property
        req.fmv = 1200000.0;
        req.offerPrice = 1000000.0;
        req.annualAppreciation = 0.03;    // 3% annual appreciation
        
        // Set income
        req.grossRentsAnnual = 100000.0;
        req.vacancyRate = 0.05;
        req.managementRate = 0.08;
        req.propertyTaxes = 12000.0;
        req.insurance = 2500.0;
        
        // Set financing
        req.firstPrincipal = 800000.0;    // 80% LTV
        req.firstRateAnnual = 0.045;
        req.firstAmortYears = 30;
        
        // Set closing costs
        req.lenderFee = 8000.0;
        req.brokerFee = 10000.0;
        req.transferTax = 5000.0;
        
        CashflowResponse resp = service.analyze(req);
        
        // Verify Real Purchase Price (RPP)
        double expectedRPP = req.offerPrice + 8000 + 10000 + 5000; // = 1,023,000
        System.out.println("  Real Purchase Price: $" + String.format("%,.2f", resp.summary.rpp) + 
                          " (Expected: $" + String.format("%,.2f", expectedRPP) + ")");
        if (!approxEqual(resp.summary.rpp, expectedRPP)) {
            System.out.println("  ERROR: RPP mismatch!");
            return false;
        }
        
        // Verify Cash to Close = RPP - Loan
        double expectedCashToClose = expectedRPP - 800000; // = 223,000
        System.out.println("  Cash to Close: $" + String.format("%,.2f", resp.summary.cashToClose) + 
                          " (Expected: $" + String.format("%,.2f", expectedCashToClose) + ")");
        if (!approxEqual(resp.summary.cashToClose, expectedCashToClose)) {
            System.out.println("  ERROR: Cash to Close mismatch!");
            return false;
        }
        
        // Verify Cash-on-Cash Return
        double annualCashFlow = resp.summary.noiY1 - resp.summary.annualDebtServiceY1;
        double expectedCoC = annualCashFlow / resp.summary.cashToClose;
        System.out.println("  Cash-on-Cash Return: " + String.format("%.2f%%", resp.summary.cashOnCashY1 * 100) + 
                          " (Expected: " + String.format("%.2f%%", expectedCoC * 100) + ")");
        if (!approxEqual(resp.summary.cashOnCashY1, expectedCoC)) {
            System.out.println("  ERROR: CoC mismatch!");
            return false;
        }
        
        // Verify Forced Appreciation ROI = (FMV - RPP) / Cash to Close
        double expectedForcedAppROI = (req.fmv - expectedRPP) / resp.summary.cashToClose;
        System.out.println("  Forced Appreciation ROI: " + String.format("%.2f%%", resp.summary.forcedAppreciationROIY1 * 100) + 
                          " (Expected: " + String.format("%.2f%%", expectedForcedAppROI * 100) + ")");
        if (!approxEqual(resp.summary.forcedAppreciationROIY1, expectedForcedAppROI)) {
            System.out.println("  ERROR: Forced Appreciation ROI mismatch!");
            return false;
        }
        
        return true;
    }
    
    /**
     * Test 5: Multi-Year Projection
     */
    public boolean testMultiYearProjection() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // Set basic parameters
        req.offerPrice = 1000000.0;
        req.grossRentsAnnual = 100000.0;
        req.vacancyRate = 0.05;
        req.managementRate = 0.08;
        req.propertyTaxes = 12000.0;
        req.insurance = 2000.0;
        
        // Set growth rates
        req.holdYears = 5;                // Hold for 5 years
        req.rentGrowth = 0.03;            // 3% annual rent growth
        req.expenseGrowth = 0.02;         // 2% annual expense growth
        req.annualAppreciation = 0.04;    // 4% annual appreciation
        
        CashflowResponse resp = service.analyze(req);
        
        // Verify projection years
        System.out.println("  Projection Period: " + resp.projection.size() + " years");
        if (resp.projection.size() != 5) {
            System.out.println("  ERROR: Projection years mismatch! Expected: 5");
            return false;
        }
        
        // Verify Year 1 data
        CashflowResponse.YearRow year1 = resp.projection.get(0);
        System.out.println("  Year 1 Total Income: $" + String.format("%,.2f", year1.totalIncome));
        if (year1.year != 1 || !approxEqual(year1.totalIncome, 100000.0)) {
            System.out.println("  ERROR: Year 1 data mismatch!");
            return false;
        }
        
        // Verify Year 5 income growth
        CashflowResponse.YearRow year5 = resp.projection.get(4);
        double expectedYear5Income = 100000 * Math.pow(1.03, 4); // Growth for 4 years to reach year 5
        System.out.println("  Year 5 Total Income: $" + String.format("%,.2f", year5.totalIncome) + 
                          " (Expected: $" + String.format("%,.2f", expectedYear5Income) + ")");
        if (!approxEqual(year5.totalIncome, expectedYear5Income, 1.0)) {
            System.out.println("  ERROR: Year 5 income growth mismatch!");
            return false;
        }
        
        // Verify property value growth
        double expectedYear5Value = 1000000 * Math.pow(1.04, 5);
        System.out.println("  Year 5 Property Value: $" + String.format("%,.2f", year5.propertyValue) + 
                          " (Expected: $" + String.format("%,.2f", expectedYear5Value) + ")");
        if (!approxEqual(year5.propertyValue, expectedYear5Value, 1.0)) {
            System.out.println("  ERROR: Year 5 property value mismatch!");
            return false;
        }
        
        System.out.println("  ✓ Multi-year projection validated with correct growth rates");
        return true;
    }
    
    /**
     * Test 6: Complete Real-World Scenario
     */
    public boolean testCompleteScenario() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // Property information
        req.address = "123 Main St";
        req.city = "Boston";
        req.state = "MA";
        req.fmv = 2500000.0;
        req.offerPrice = 2300000.0;
        req.annualAppreciation = 0.035;
        req.numberOfUnits = 12;
        
        // Income streams
        req.grossRentsAnnual = 240000.0;  // $2,000 per unit per month
        req.parkingAnnual = 12000.0;
        req.storageAnnual = 4800.0;
        req.laundryVendingAnnual = 3600.0;
        
        // Vacancy and management
        req.vacancyRate = 0.06;
        req.managementRate = 0.09;
        req.repairsRate = 0.05;
        
        // Operating expenses
        req.propertyTaxes = 35000.0;
        req.insurance = 8000.0;
        req.electricity = 6000.0;
        req.waterSewer = 12000.0;
        req.trash = 3600.0;
        req.commonAreaMaintenance = 8000.0;
        
        // Primary loan
        req.firstPrincipal = 1840000.0;   // 80% LTV on offer price
        req.firstRateAnnual = 0.0525;
        req.firstAmortYears = 30;
        req.firstInterestOnlyYears = 0;
        
        // Closing costs
        req.lenderFee = 18400.0;
        req.brokerFee = 23000.0;
        req.transferTax = 11500.0;
        req.legalClose = 5000.0;
        req.inspections = 2000.0;
        
        // Hold period
        req.holdYears = 10;
        req.rentGrowth = 0.03;
        req.expenseGrowth = 0.025;
        req.exitCostRate = 0.08;
        
        CashflowResponse resp = service.analyze(req);
        
        System.out.println("\n  === 12-UNIT APARTMENT BUILDING ANALYSIS ===");
        System.out.println("  Property: " + req.address + ", " + req.city + ", " + req.state);
        System.out.println("  Units: " + req.numberOfUnits);
        System.out.println("  Offer Price: $" + String.format("%,.2f", req.offerPrice));
        System.out.println("  Fair Market Value: $" + String.format("%,.2f", req.fmv));
        System.out.println("\n  --- YEAR 1 METRICS ---");
        System.out.println("  Real Purchase Price: $" + String.format("%,.2f", resp.summary.rpp));
        System.out.println("  Cash to Close: $" + String.format("%,.2f", resp.summary.cashToClose));
        System.out.println("  Gross Annual Rent: $" + String.format("%,.2f", req.grossRentsAnnual));
        System.out.println("  Avg Rent per Unit/Month: $" + String.format("%,.2f", resp.summary.avgRentPerUnitY1));
        System.out.println("  Net Operating Income (NOI): $" + String.format("%,.2f", resp.summary.noiY1));
        System.out.println("  Annual Debt Service: $" + String.format("%,.2f", resp.summary.annualDebtServiceY1));
        System.out.println("\n  --- INVESTMENT METRICS ---");
        System.out.println("  Cap Rate (Purchase Price): " + String.format("%.2f%%", resp.summary.capRatePPY1 * 100));
        System.out.println("  Cap Rate (FMV): " + String.format("%.2f%%", resp.summary.capRateFMVY1 * 100));
        System.out.println("  DSCR: " + String.format("%.2f", resp.summary.dscrY1));
        System.out.println("  LTV (vs FMV): " + String.format("%.2f%%", resp.summary.ltvFMV * 100));
        System.out.println("  Cash-on-Cash Return: " + String.format("%.2f%%", resp.summary.cashOnCashY1 * 100));
        System.out.println("  Total ROI (Year 1): " + String.format("%.2f%%", resp.summary.totalROIY1 * 100));
        System.out.println("\n  --- 10-YEAR PROJECTIONS ---");
        System.out.println("  IRR (Internal Rate of Return): " + String.format("%.2f%%", resp.summary.irr * 100));
        System.out.println("  Equity Multiple: " + String.format("%.2fx", resp.summary.equityMultiple));
        System.out.println("  Net Sale Proceeds (Year 10): $" + String.format("%,.2f", resp.summary.saleProceedsNet));
        
        // Validate key metrics
        if (resp.summary == null) {
            System.out.println("\n  ERROR: Summary is null!");
            return false;
        }
        
        // Verify avg rent per unit
        double expectedAvgRent = 240000.0 / 12.0 / 12.0; // = $2,000/month
        if (!approxEqual(resp.summary.avgRentPerUnitY1, expectedAvgRent)) {
            System.out.println("\n  ERROR: Avg rent per unit mismatch!");
            return false;
        }
        
        // Verify LTV
        double expectedLTV = 1840000.0 / 2500000.0;
        if (!approxEqual(resp.summary.ltvFMV, expectedLTV)) {
            System.out.println("\n  ERROR: LTV mismatch!");
            return false;
        }
        
        // Verify IRR exists
        if (resp.summary.irr == null) {
            System.out.println("\n  ERROR: IRR should be calculated!");
            return false;
        }
        
        // Verify equity multiple exists and is reasonable
        if (resp.summary.equityMultiple == null || resp.summary.equityMultiple <= 0) {
            System.out.println("\n  ERROR: Equity multiple should be positive!");
            return false;
        }
        
        // Verify exit proceeds exist
        if (resp.summary.saleProceedsNet == null) {
            System.out.println("\n  ERROR: Sale proceeds should be calculated!");
            return false;
        }
        
        System.out.println("\n  ✓ Complete scenario analysis validated successfully!");
        return true;
    }
    
    /**
     * Test 7: Interest-Only Period
     */
    public boolean testInterestOnlyPeriod() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // Set basic parameters
        req.offerPrice = 1000000.0;
        req.grossRentsAnnual = 100000.0;
        req.vacancyRate = 0.05;
        req.managementRate = 0.08;
        req.propertyTaxes = 10000.0;
        req.insurance = 2000.0;
        
        // Set loan with interest-only period
        req.firstPrincipal = 800000.0;
        req.firstRateAnnual = 0.05;
        req.firstAmortYears = 30;
        req.firstInterestOnlyYears = 3;   // First 3 years interest-only
        
        req.holdYears = 5;
        
        CashflowResponse resp = service.analyze(req);
        
        System.out.println("  Loan Amount: $" + String.format("%,.2f", req.firstPrincipal));
        System.out.println("  Interest-Only Period: " + req.firstInterestOnlyYears + " years");
        System.out.println("  Annual Interest Rate: " + String.format("%.2f%%", req.firstRateAnnual * 100));
        
        // During interest-only period, principal balance should remain unchanged
        if (resp.projection.size() < 3) {
            System.out.println("\n  ERROR: Projection period insufficient!");
            return false;
        }
        
        double year1Balance = resp.projection.get(0).endingBalanceFirst;
        double year2Balance = resp.projection.get(1).endingBalanceFirst;
        double year3Balance = resp.projection.get(2).endingBalanceFirst;
        
        System.out.println("\n  --- LOAN BALANCE TRACKING ---");
        System.out.println("  Year 1 Ending Balance: $" + String.format("%,.2f", year1Balance));
        System.out.println("  Year 2 Ending Balance: $" + String.format("%,.2f", year2Balance));
        System.out.println("  Year 3 Ending Balance: $" + String.format("%,.2f", year3Balance));
        
        // First 3 years balance should equal original principal
        if (!approxEqual(year1Balance, 800000.0, 10.0) || 
            !approxEqual(year2Balance, 800000.0, 10.0) || 
            !approxEqual(year3Balance, 800000.0, 10.0)) {
            System.out.println("\n  ERROR: Principal balance should remain unchanged during interest-only period!");
            return false;
        }
        
        // Year 4 should show principal paydown
        if (resp.projection.size() >= 4) {
            double year4Balance = resp.projection.get(3).endingBalanceFirst;
            System.out.println("  Year 4 Ending Balance: $" + String.format("%,.2f", year4Balance));
            double principalPaidYear4 = year3Balance - year4Balance;
            System.out.println("  Principal Paid in Year 4: $" + String.format("%,.2f", principalPaidYear4));
            
            if (year4Balance >= year3Balance) {
                System.out.println("\n  ERROR: Year 4 principal balance should decrease!");
                return false;
            }
            System.out.println("\n  ✓ Interest-only period validated: Balance constant for 3 years, then amortization begins");
        }
        
        return true;
    }
    
    /**
     * Helper method: Compare two doubles with default tolerance (0.01)
     */
    private boolean approxEqual(Double a, Double b) {
        return approxEqual(a, b, 0.01);
    }
    
    /**
     * Helper method: Compare two doubles with specified tolerance
     */
    private boolean approxEqual(Double a, Double b, double tolerance) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return Math.abs(a - b) < tolerance;
    }
}
