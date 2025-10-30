# RealtyInUS - API + Cashflow Calculator Integration

## 🎯 Project Overview

Successfully integrated **Real Estate API data** with **Advanced Cashflow Calculator** to generate comprehensive investment analysis reports.

## 📦 What We Built

### 1. **API Data Layer** (`realtyinus`)
- `RealtyAggregationService` - Aggregates property data from RapidAPI
- `EnrichedProperty` - Property data model
- Property search and enrichment with details and photos

### 2. **Cashflow Calculator** (`calculator`)
- `CashflowService` - Advanced investment analysis engine
- Multi-year cashflow projections (10+ years)
- IRR (Internal Rate of Return) calculation
- Equity Multiple calculation
- DSCR (Debt Service Coverage Ratio)
- Cap Rate, Cash-on-Cash Return, and more

### 3. **Report Generators**
Two powerful report generators:

#### A. **SinglePropertyReportGenerator**
- Basic property investment analysis
- Year 1 metrics
- Simple calculations
- **Output**: JSON, HTML, TXT reports

#### B. **EnhancedInvestmentReportGenerator** ⭐ (NEW)
- **Complete integration** of API + Calculator
- Advanced multi-year projections
- Comprehensive financial metrics
- **Output**: Enhanced JSON, HTML, TXT reports

## 📊 Generated Reports

### Latest Enhanced Report (16:05:58)

**Files Generated:**
1. `enhanced_analysis_20251021_160558.json` (6.8K) - Complete data
2. `enhanced_report_20251021_160558.html` (8.0K) - Interactive visualization
3. `enhanced_text_report_20251021_160558.txt` (3.3K) - Detailed analysis

## 🔑 Key Metrics Calculated

### Immediate Metrics (Year 1)
- ✅ **NOI (Net Operating Income)**: $39,545
- ✅ **Cash Flow**: ($16,437)/year, ($1,370)/month
- ✅ **Cap Rate**: 4.16% on purchase price
- ✅ **DSCR**: 0.71
- ✅ **Cash on Cash Return**: -5.38%

### Advanced Metrics (Multi-Year)
- ✅ **IRR (10-year)**: 7.48%
- ✅ **Equity Multiple**: 2.55x
- ✅ **Exit Proceeds (Year 10)**: $782,020
- ✅ **Total ROI (Year 1)**: 11.56%
- ✅ **Appreciation ROI**: 14.35%

### Income & Expenses Breakdown
```
Gross Potential Income:     $79,800
Vacancy Loss:                ($3,990)
Effective Gross Income:      $75,810
Total Operating Expenses:    $36,265
Net Operating Income:        $39,545
Annual Debt Service:         $55,983
Cash Flow Before Tax:        ($16,437)
```

## 📈 10-Year Projection

The calculator generates year-by-year projections including:
- Income growth (3% annually)
- Expense growth (2.5% annually)
- Property appreciation (4.5% annually)
- Loan amortization
- Exit value and sale proceeds

## 🏗️ Project Structure

```
realtyinus/
├── src/
│   ├── main/java/com/ireia/realty/
│   │   ├── api/
│   │   │   ├── RapidApiGenericClient.java
│   │   │   └── dto/
│   │   │       ├── EnrichedProperty.java
│   │   │       └── EnrichedListQuery.java
│   │   ├── calculator/                    # ⭐ NEW
│   │   │   ├── CashflowService.java       # Advanced calculator
│   │   │   ├── CashflowRequest.java
│   │   │   └── CashflowResponse.java
│   │   ├── service/
│   │   │   └── RealtyAggregationService.java
│   │   └── web/
│   │       └── EnrichedController.java
│   └── test/java/com/ireia/realty/
│       ├── SinglePropertyReportGenerator.java
│       └── EnhancedInvestmentReportGenerator.java  # ⭐ NEW
├── output/
│   ├── enhanced_analysis_*.json           # Complete data
│   ├── enhanced_report_*.html             # Interactive report
│   └── enhanced_text_report_*.txt         # Detailed analysis
├── pom.xml
└── README.md
```

## 🚀 How to Run

### Generate Enhanced Report

```bash
cd realtyinus
mvn clean compile test-compile
mvn exec:java -Dexec.mainClass="com.ireia.realty.EnhancedInvestmentReportGenerator" -Dexec.classpathScope=test
```

### Generate Simple Report

```bash
mvn exec:java -Dexec.mainClass="com.ireia.realty.SinglePropertyReportGenerator" -Dexec.classpathScope=test
```

## 💡 Key Features

### 1. **Advanced Financial Calculations**
- ✅ Multi-year cashflow projections
- ✅ IRR calculation using Newton-Raphson method
- ✅ Equity multiple computation
- ✅ Principal pay-down tracking
- ✅ Property appreciation modeling

### 2. **Comprehensive Expense Modeling**
- Property taxes
- Insurance
- HOA fees
- Utilities (electricity, gas, water)
- Management fees (% of income)
- Repairs & maintenance (% of rent)
- Capital improvements
- Professional fees (accounting, legal)
- And more...

### 3. **Loan Amortization**
- Support for primary and secondary loans
- Interest-only period support
- Annual payment tracking
- Balance tracking over time
- Principal pay-down calculation

### 4. **Growth Modeling**
- Rent growth (3% default)
- Expense growth (2.5% default)
- Property appreciation (4.5% default)
- Customizable rates

### 5. **Exit Analysis**
- Sale proceeds calculation
- Exit costs (6% default)
- Net proceeds after loan payoff
- Total return calculation

## 📊 Sample Investment Analysis

**Property**: 456 Beacon Street, Boston, MA  
**Type**: Multi-Family (2 Units)  
**Price**: $950,000  
**Down Payment**: 25% ($237,500)  
**Loan**: $712,500 @ 6.75% for 30 years

**Key Results:**
- Year 1 cash flow is negative (appreciation play)
- Strong equity building through appreciation (14.35% ROI)
- 10-year hold doubles investment (2.55x equity multiple)
- 7.48% IRR over 10 years
- $782k net proceeds at exit

## 🎓 Investment Recommendations

The system provides automated recommendations based on:

1. **Cash-on-Cash Return**
   - Excellent: >8%
   - Good: 5-8%
   - Low: <5%

2. **DSCR (Debt Service Coverage)**
   - Strong: >1.25
   - Adequate: 1.0-1.25
   - Risky: <1.0

3. **IRR (Internal Rate of Return)**
   - Excellent: >12%
   - Good: 8-12%
   - Low: <8%

4. **Equity Multiple**
   - Strong: >2.0x
   - Moderate: 1.5-2.0x
   - Low: <1.5x

## 🔧 Technical Stack

- **Java 17**
- **Spring Boot 3.2.0**
- **Jackson** (JSON processing)
- **Apache HttpClient 5**
- **Maven**

## 📝 Next Steps

1. ✅ Integrate with real RapidAPI data
2. ✅ Add more property types (commercial, mixed-use)
3. ✅ Implement tax analysis (depreciation, tax benefits)
4. ✅ Add comparison reports (multiple properties)
5. ✅ Create REST API endpoints for web frontend
6. ✅ Add database persistence

## 📄 License

MIT License

## 👨‍💻 Author

Real-Time Real Estate Investment Analysis Team  
Built with ❤️ for CS681 Project

---

**Last Updated**: October 21, 2025, 16:05:58



