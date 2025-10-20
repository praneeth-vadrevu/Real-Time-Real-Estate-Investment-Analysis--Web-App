package com.example.analysis.service;

import com.example.analysis.dto.CashflowRequest;
import com.example.analysis.dto.CashflowResponse;

/**
 * 测试类：验证现金流分析计算器的核心功能
 * 包括收入计算、费用计算、债务服务、资本化率和投资回报率等指标
 */
public class CashflowServiceTest {

    public static void main(String[] args) {
        CashflowServiceTest test = new CashflowServiceTest();
        
        System.out.println("====================================");
        System.out.println("   现金流分析计算器 - 测试套件");
        System.out.println("====================================\n");
        
        int passed = 0;
        int total = 0;
        
        // 测试 1: 基础收入和NOI计算
        total++;
        if (test.testBasicIncomeAndNOI()) {
            passed++;
            System.out.println("✓ 测试 1: 基础收入和NOI计算 - 通过");
        } else {
            System.out.println("✗ 测试 1: 基础收入和NOI计算 - 失败");
        }
        
        // 测试 2: 债务服务和DSCR计算
        total++;
        if (test.testDebtServiceAndDSCR()) {
            passed++;
            System.out.println("✓ 测试 2: 债务服务和DSCR计算 - 通过");
        } else {
            System.out.println("✗ 测试 2: 债务服务和DSCR计算 - 失败");
        }
        
        // 测试 3: 资本化率计算
        total++;
        if (test.testCapRates()) {
            passed++;
            System.out.println("✓ 测试 3: 资本化率计算 - 通过");
        } else {
            System.out.println("✗ 测试 3: 资本化率计算 - 失败");
        }
        
        // 测试 4: 现金对现金回报率和ROI
        total++;
        if (test.testCashOnCashAndROI()) {
            passed++;
            System.out.println("✓ 测试 4: 现金对现金回报率和ROI - 通过");
        } else {
            System.out.println("✗ 测试 4: 现金对现金回报率和ROI - 失败");
        }
        
        // 测试 5: 多年期预测
        total++;
        if (test.testMultiYearProjection()) {
            passed++;
            System.out.println("✓ 测试 5: 多年期预测 - 通过");
        } else {
            System.out.println("✗ 测试 5: 多年期预测 - 失败");
        }
        
        // 测试 6: 综合场景测试
        total++;
        if (test.testCompleteScenario()) {
            passed++;
            System.out.println("✓ 测试 6: 综合场景测试 - 通过");
        } else {
            System.out.println("✗ 测试 6: 综合场景测试 - 失败");
        }
        
        // 测试 7: 纯利息期间测试
        total++;
        if (test.testInterestOnlyPeriod()) {
            passed++;
            System.out.println("✓ 测试 7: 纯利息期间测试 - 通过");
        } else {
            System.out.println("✗ 测试 7: 纯利息期间测试 - 失败");
        }
        
        System.out.println("\n====================================");
        System.out.println("测试结果: " + passed + "/" + total + " 通过");
        System.out.println("成功率: " + String.format("%.1f%%", (passed * 100.0 / total)));
        System.out.println("====================================");
        
        System.exit(passed == total ? 0 : 1);
    }
    
    /**
     * 测试 1: 基础收入和净营业收入(NOI)计算
     */
    public boolean testBasicIncomeAndNOI() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // 设置基本收入
        req.grossRentsAnnual = 120000.0;  // 年租金收入
        req.parkingAnnual = 6000.0;       // 停车费
        req.storageAnnual = 2400.0;       // 仓储费
        req.vacancyRate = 0.05;           // 5% 空置率
        
        // 设置费用
        req.managementRate = 0.10;        // 10% 管理费
        req.propertyTaxes = 15000.0;      // 房产税
        req.insurance = 3000.0;           // 保险
        
        CashflowResponse resp = service.analyze(req);
        
        // 验证总收入 = 租金 + 停车 + 仓储
        double expectedTotalIncome = 120000 + 6000 + 2400; // = 128400
        if (!approxEqual(resp.summary.totalIncomeY1, expectedTotalIncome)) {
            System.out.println("  错误: 总收入不匹配. 期望: " + expectedTotalIncome + ", 实际: " + resp.summary.totalIncomeY1);
            return false;
        }
        
        // 验证空置损失 = 总收入 * 空置率 (负数)
        double expectedVacancyLoss = -128400 * 0.05; // = -6420
        if (!approxEqual(resp.summary.vacancyLossY1, expectedVacancyLoss)) {
            System.out.println("  错误: 空置损失不匹配. 期望: " + expectedVacancyLoss + ", 实际: " + resp.summary.vacancyLossY1);
            return false;
        }
        
        // 验证有效总收入(EGI) = 总收入 + 空置损失
        double expectedEGI = 128400 - 6420; // = 121980
        if (!approxEqual(resp.summary.egiY1, expectedEGI)) {
            System.out.println("  错误: EGI不匹配. 期望: " + expectedEGI + ", 实际: " + resp.summary.egiY1);
            return false;
        }
        
        // 验证NOI (无债务时)
        double expectedNOI = expectedEGI - (expectedEGI * 0.10) - 15000 - 3000;
        if (!approxEqual(resp.summary.noiY1, expectedNOI)) {
            System.out.println("  错误: NOI不匹配. 期望: " + expectedNOI + ", 实际: " + resp.summary.noiY1);
            return false;
        }
        
        return true;
    }
    
    /**
     * 测试 2: 债务服务和债务偿还覆盖率(DSCR)计算
     */
    public boolean testDebtServiceAndDSCR() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // 设置收入
        req.grossRentsAnnual = 100000.0;
        req.vacancyRate = 0.05;
        
        // 设置费用（简单场景）
        req.managementRate = 0.08;
        req.propertyTaxes = 10000.0;
        req.insurance = 2000.0;
        
        // 设置贷款
        req.firstPrincipal = 1000000.0;   // 100万贷款
        req.firstRateAnnual = 0.05;       // 5% 年利率
        req.firstAmortYears = 30;         // 30年摊还
        req.firstInterestOnlyYears = 0;   // 无纯利息期
        
        CashflowResponse resp = service.analyze(req);
        
        // 验证年债务服务存在且为正数
        if (resp.summary.annualDebtServiceY1 == null || resp.summary.annualDebtServiceY1 <= 0) {
            System.out.println("  错误: 年债务服务应为正数");
            return false;
        }
        
        // 验证DSCR = NOI / 年债务服务
        double expectedDSCR = resp.summary.noiY1 / resp.summary.annualDebtServiceY1;
        if (!approxEqual(resp.summary.dscrY1, expectedDSCR)) {
            System.out.println("  错误: DSCR不匹配. 期望: " + expectedDSCR + ", 实际: " + resp.summary.dscrY1);
            return false;
        }
        
        // DSCR应该大于1才算健康投资
        if (resp.summary.dscrY1 < 1.0) {
            System.out.println("  警告: DSCR < 1.0，这在实际投资中可能有风险");
        }
        
        return true;
    }
    
    /**
     * 测试 3: 资本化率(Cap Rate)计算
     */
    public boolean testCapRates() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // 设置物业价值
        req.fmv = 1500000.0;              // 公允市场价值 150万
        req.offerPrice = 1400000.0;       // 报价 140万
        
        // 设置收入
        req.grossRentsAnnual = 120000.0;
        req.vacancyRate = 0.05;
        req.managementRate = 0.08;
        req.propertyTaxes = 18000.0;
        req.insurance = 3000.0;
        
        CashflowResponse resp = service.analyze(req);
        
        // 验证基于报价的资本化率
        double expectedCapRatePP = resp.summary.noiY1 / req.offerPrice;
        if (!approxEqual(resp.summary.capRatePPY1, expectedCapRatePP)) {
            System.out.println("  错误: Cap Rate (PP)不匹配. 期望: " + expectedCapRatePP + ", 实际: " + resp.summary.capRatePPY1);
            return false;
        }
        
        // 验证基于公允市场价值的资本化率
        double expectedCapRateFMV = resp.summary.noiY1 / req.fmv;
        if (!approxEqual(resp.summary.capRateFMVY1, expectedCapRateFMV)) {
            System.out.println("  错误: Cap Rate (FMV)不匹配. 期望: " + expectedCapRateFMV + ", 实际: " + resp.summary.capRateFMVY1);
            return false;
        }
        
        // Cap Rate应该在合理范围内 (通常 3%-10%)
        if (resp.summary.capRatePPY1 < 0.03 || resp.summary.capRatePPY1 > 0.15) {
            System.out.println("  警告: Cap Rate超出典型范围: " + String.format("%.2f%%", resp.summary.capRatePPY1 * 100));
        }
        
        return true;
    }
    
    /**
     * 测试 4: 现金对现金回报率和ROI指标
     */
    public boolean testCashOnCashAndROI() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // 设置物业
        req.fmv = 1200000.0;
        req.offerPrice = 1000000.0;
        req.annualAppreciation = 0.03;    // 3% 年增值
        
        // 设置收入
        req.grossRentsAnnual = 100000.0;
        req.vacancyRate = 0.05;
        req.managementRate = 0.08;
        req.propertyTaxes = 12000.0;
        req.insurance = 2500.0;
        
        // 设置融资
        req.firstPrincipal = 800000.0;    // 80% LTV
        req.firstRateAnnual = 0.045;
        req.firstAmortYears = 30;
        
        // 设置交割成本
        req.lenderFee = 8000.0;
        req.brokerFee = 10000.0;
        req.transferTax = 5000.0;
        
        CashflowResponse resp = service.analyze(req);
        
        // 验证真实购买价格(RPP)
        double expectedRPP = req.offerPrice + 8000 + 10000 + 5000; // = 1023000
        if (!approxEqual(resp.summary.rpp, expectedRPP)) {
            System.out.println("  错误: RPP不匹配. 期望: " + expectedRPP + ", 实际: " + resp.summary.rpp);
            return false;
        }
        
        // 验证交割现金 = RPP - 贷款
        double expectedCashToClose = expectedRPP - 800000; // = 223000
        if (!approxEqual(resp.summary.cashToClose, expectedCashToClose)) {
            System.out.println("  错误: 交割现金不匹配. 期望: " + expectedCashToClose + ", 实际: " + resp.summary.cashToClose);
            return false;
        }
        
        // 验证现金对现金回报率
        double annualCashFlow = resp.summary.noiY1 - resp.summary.annualDebtServiceY1;
        double expectedCoC = annualCashFlow / resp.summary.cashToClose;
        if (!approxEqual(resp.summary.cashOnCashY1, expectedCoC)) {
            System.out.println("  错误: CoC不匹配. 期望: " + expectedCoC + ", 实际: " + resp.summary.cashOnCashY1);
            return false;
        }
        
        // 验证强制增值ROI = (FMV - RPP) / 交割现金
        double expectedForcedAppROI = (req.fmv - expectedRPP) / resp.summary.cashToClose;
        if (!approxEqual(resp.summary.forcedAppreciationROIY1, expectedForcedAppROI)) {
            System.out.println("  错误: 强制增值ROI不匹配. 期望: " + expectedForcedAppROI + ", 实际: " + resp.summary.forcedAppreciationROIY1);
            return false;
        }
        
        return true;
    }
    
    /**
     * 测试 5: 多年期预测
     */
    public boolean testMultiYearProjection() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // 设置基本参数
        req.offerPrice = 1000000.0;
        req.grossRentsAnnual = 100000.0;
        req.vacancyRate = 0.05;
        req.managementRate = 0.08;
        req.propertyTaxes = 12000.0;
        req.insurance = 2000.0;
        
        // 设置增长率
        req.holdYears = 5;                // 持有5年
        req.rentGrowth = 0.03;            // 租金年增长3%
        req.expenseGrowth = 0.02;         // 费用年增长2%
        req.annualAppreciation = 0.04;    // 物业增值4%
        
        CashflowResponse resp = service.analyze(req);
        
        // 验证预测年数
        if (resp.projection.size() != 5) {
            System.out.println("  错误: 预测年数不匹配. 期望: 5, 实际: " + resp.projection.size());
            return false;
        }
        
        // 验证第一年数据
        CashflowResponse.YearRow year1 = resp.projection.get(0);
        if (year1.year != 1) {
            System.out.println("  错误: 第一年的年份应为1");
            return false;
        }
        
        // 验证第一年总收入
        if (!approxEqual(year1.totalIncome, 100000.0)) {
            System.out.println("  错误: 第一年总收入不匹配");
            return false;
        }
        
        // 验证第五年收入增长
        CashflowResponse.YearRow year5 = resp.projection.get(4);
        double expectedYear5Income = 100000 * Math.pow(1.03, 4); // 增长4年到第5年
        if (!approxEqual(year5.totalIncome, expectedYear5Income, 1.0)) {
            System.out.println("  错误: 第五年收入增长不匹配. 期望: " + expectedYear5Income + ", 实际: " + year5.totalIncome);
            return false;
        }
        
        // 验证物业价值增长
        double expectedYear5Value = 1000000 * Math.pow(1.04, 5);
        if (!approxEqual(year5.propertyValue, expectedYear5Value, 1.0)) {
            System.out.println("  错误: 第五年物业价值不匹配. 期望: " + expectedYear5Value + ", 实际: " + year5.propertyValue);
            return false;
        }
        
        return true;
    }
    
    /**
     * 测试 6: 综合真实场景
     */
    public boolean testCompleteScenario() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // 物业信息
        req.address = "123 Main St";
        req.city = "Boston";
        req.state = "MA";
        req.fmv = 2500000.0;
        req.offerPrice = 2300000.0;
        req.annualAppreciation = 0.035;
        req.numberOfUnits = 12;
        
        // 收入
        req.grossRentsAnnual = 240000.0;  // 每单元每月$2000
        req.parkingAnnual = 12000.0;
        req.storageAnnual = 4800.0;
        req.laundryVendingAnnual = 3600.0;
        
        // 空置和管理
        req.vacancyRate = 0.06;
        req.managementRate = 0.09;
        req.repairsRate = 0.05;
        
        // 运营费用
        req.propertyTaxes = 35000.0;
        req.insurance = 8000.0;
        req.electricity = 6000.0;
        req.waterSewer = 12000.0;
        req.trash = 3600.0;
        req.commonAreaMaintenance = 8000.0;
        
        // 主贷款
        req.firstPrincipal = 1840000.0;   // 80% LTV on offer price
        req.firstRateAnnual = 0.0525;
        req.firstAmortYears = 30;
        req.firstInterestOnlyYears = 0;
        
        // 交割成本
        req.lenderFee = 18400.0;
        req.brokerFee = 23000.0;
        req.transferTax = 11500.0;
        req.legalClose = 5000.0;
        req.inspections = 2000.0;
        
        // 持有期
        req.holdYears = 10;
        req.rentGrowth = 0.03;
        req.expenseGrowth = 0.025;
        req.exitCostRate = 0.08;
        
        CashflowResponse resp = service.analyze(req);
        
        // 验证关键指标的存在性和合理性
        if (resp.summary == null) {
            System.out.println("  错误: 摘要为空");
            return false;
        }
        
        // 验证每单元平均租金
        double expectedAvgRent = 240000.0 / 12.0 / 12.0; // = $2000/月
        if (!approxEqual(resp.summary.avgRentPerUnitY1, expectedAvgRent)) {
            System.out.println("  错误: 每单元平均租金不匹配. 期望: " + expectedAvgRent + ", 实际: " + resp.summary.avgRentPerUnitY1);
            return false;
        }
        
        // 验证LTV
        double expectedLTV = 1840000.0 / 2500000.0;
        if (!approxEqual(resp.summary.ltvFMV, expectedLTV)) {
            System.out.println("  错误: LTV不匹配. 期望: " + expectedLTV + ", 实际: " + resp.summary.ltvFMV);
            return false;
        }
        
        // 验证IRR存在
        if (resp.summary.irr == null) {
            System.out.println("  错误: IRR应该被计算");
            return false;
        }
        
        // 验证权益倍数存在且合理
        if (resp.summary.equityMultiple == null || resp.summary.equityMultiple <= 0) {
            System.out.println("  错误: 权益倍数应为正数");
            return false;
        }
        
        // 验证退出收益存在
        if (resp.summary.saleProceedsNet == null) {
            System.out.println("  错误: 退出收益应该被计算");
            return false;
        }
        
        System.out.println("  详细结果:");
        System.out.println("    - 真实购买价格: $" + String.format("%,.2f", resp.summary.rpp));
        System.out.println("    - 交割现金: $" + String.format("%,.2f", resp.summary.cashToClose));
        System.out.println("    - 第一年NOI: $" + String.format("%,.2f", resp.summary.noiY1));
        System.out.println("    - Cap Rate (PP): " + String.format("%.2f%%", resp.summary.capRatePPY1 * 100));
        System.out.println("    - DSCR: " + String.format("%.2f", resp.summary.dscrY1));
        System.out.println("    - 现金对现金回报率: " + String.format("%.2f%%", resp.summary.cashOnCashY1 * 100));
        System.out.println("    - IRR: " + String.format("%.2f%%", resp.summary.irr * 100));
        System.out.println("    - 权益倍数: " + String.format("%.2fx", resp.summary.equityMultiple));
        
        return true;
    }
    
    /**
     * 测试 7: 纯利息期间
     */
    public boolean testInterestOnlyPeriod() {
        CashflowService service = new CashflowService();
        CashflowRequest req = new CashflowRequest();
        
        // 设置基本参数
        req.offerPrice = 1000000.0;
        req.grossRentsAnnual = 100000.0;
        req.vacancyRate = 0.05;
        req.managementRate = 0.08;
        req.propertyTaxes = 10000.0;
        req.insurance = 2000.0;
        
        // 设置有利息期的贷款
        req.firstPrincipal = 800000.0;
        req.firstRateAnnual = 0.05;
        req.firstAmortYears = 30;
        req.firstInterestOnlyYears = 3;   // 前3年只付利息
        
        req.holdYears = 5;
        
        CashflowResponse resp = service.analyze(req);
        
        // 在利息期内，本金余额应该保持不变
        if (resp.projection.size() < 3) {
            System.out.println("  错误: 预测期不足");
            return false;
        }
        
        double year1Balance = resp.projection.get(0).endingBalanceFirst;
        double year2Balance = resp.projection.get(1).endingBalanceFirst;
        double year3Balance = resp.projection.get(2).endingBalanceFirst;
        
        // 前3年余额应该等于原始本金
        if (!approxEqual(year1Balance, 800000.0, 10.0) || 
            !approxEqual(year2Balance, 800000.0, 10.0) || 
            !approxEqual(year3Balance, 800000.0, 10.0)) {
            System.out.println("  错误: 利息期内本金余额应保持不变");
            System.out.println("    年1余额: " + year1Balance);
            System.out.println("    年2余额: " + year2Balance);
            System.out.println("    年3余额: " + year3Balance);
            return false;
        }
        
        // 第4年开始应该有本金偿还
        if (resp.projection.size() >= 4) {
            double year4Balance = resp.projection.get(3).endingBalanceFirst;
            if (year4Balance >= year3Balance) {
                System.out.println("  错误: 第4年本金余额应该减少");
                return false;
            }
        }
        
        System.out.println("  详细结果:");
        System.out.println("    - 年1贷款余额: $" + String.format("%,.2f", year1Balance));
        System.out.println("    - 年3贷款余额: $" + String.format("%,.2f", year3Balance));
        if (resp.projection.size() >= 4) {
            System.out.println("    - 年4贷款余额: $" + String.format("%,.2f", resp.projection.get(3).endingBalanceFirst));
        }
        
        return true;
    }
    
    /**
     * 辅助方法：比较两个双精度数是否近似相等（默认容差0.01）
     */
    private boolean approxEqual(Double a, Double b) {
        return approxEqual(a, b, 0.01);
    }
    
    /**
     * 辅助方法：比较两个双精度数是否近似相等（指定容差）
     */
    private boolean approxEqual(Double a, Double b, double tolerance) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return Math.abs(a - b) < tolerance;
    }
}

