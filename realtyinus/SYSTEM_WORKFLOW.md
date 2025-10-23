# 🔄 System Workflow - 系统工作流程

---

## 📊 完整工作流程图

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER INPUT                                  │
│                         用户输入                                      │
├─────────────────────────────────────────────────────────────────────┤
│  • City: "Boston"                                                   │
│  • State: "MA"                                                      │
│  • Status: "for_sale" / "for_rent" / "sold"                        │
│  • Limit: 5 properties                                              │
└─────────────────────────────────────────────────────────────────────┘
                            ⬇
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 1: API DATA RETRIEVAL                       │
│                    步骤1: API数据获取                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Module: RapidApiGenericClient                                      │
│  Action: Call RealtyInUS API                                        │
│                                                                     │
│  Request:                                                           │
│    GET https://realty-in-us.p.rapidapi.com/properties/v3/list      │
│    Headers: X-RapidAPI-Key, X-RapidAPI-Host                        │
│    Params: city=Boston, state_code=MA, status=for_sale, limit=5    │
│                                                                     │
│  Response: JSON Array                                               │
│    [                                                                │
│      {                                                              │
│        "property_id": "...",                                        │
│        "address": "123 Commonwealth Ave",                           │
│        "list_price": 850000,                                        │
│        "beds": 3,                                                   │
│        "baths": 2.0,                                                │
│        "sqft": 1650,                                                │
│        "status": "for_sale",                                        │
│        "days_on_market": 39,                                        │
│        ...                                                          │
│      },                                                             │
│      ...more properties                                             │
│    ]                                                                │
└─────────────────────────────────────────────────────────────────────┘
                            ⬇
┌─────────────────────────────────────────────────────────────────────┐
│                    STEP 2: DATA PARSING                             │
│                    步骤2: 数据解析                                    │
├─────────────────────────────────────────────────────────────────────┤
│  Module: Jackson ObjectMapper                                       │
│  Action: Parse JSON to Java Objects                                 │
│                                                                     │
│  Convert:                                                           │
│    JSON → PropertyData[]                                            │
│                                                                     │
│  Extract fields:                                                    │
│    • address, city, state, zipCode                                  │
│    • status, listPrice, estimatedValue                              │
│    • bedrooms, bathrooms, sqft                                      │
│    • propertyType, yearBuilt                                        │
│    • monthlyRent, daysOnMarket, listingDate                         │
│                                                                     │
│  Result: List<PropertyData> (5 properties)                          │
└─────────────────────────────────────────────────────────────────────┘
                            ⬇
                    ┌───────┴───────┐
                    ⬇               ⬇
        ┌────────────────┐  ┌────────────────┐
        │  PATH A        │  │  PATH B        │
        │  报告类型1       │  │  报告类型2       │
        │  房源列表        │  │  详细分析        │
        └────────────────┘  └────────────────┘
                    │               │
                    ⬇               ⬇

┌─────────────────────────────────────────────────────────────────────┐
│         PATH A: REPORT TYPE 1 - PROPERTY LIST                       │
│         路径A: 报告类型1 - 房源列表                                    │
├─────────────────────────────────────────────────────────────────────┤
│  STEP 3A: CREATE LIST REPORT                                        │
│                                                                     │
│  Input: List<PropertyData> (5 properties)                           │
│                                                                     │
│  Processing:                                                        │
│    • Group all properties into single report                        │
│    • Calculate $/sqft for each property                             │
│    • Add status color coding                                        │
│    • Sort by days on market or price                                │
│                                                                     │
│  Output Format 1: JSON                                              │
│    {                                                                │
│      "area": "Boston, MA",                                          │
│      "totalProperties": 5,                                          │
│      "properties": [ ...all 5 properties... ]                       │
│    }                                                                │
│    ✓ Saved: property_list_Boston_*.json (2.1K)                     │
│                                                                     │
│  Output Format 2: Excel                                             │
│    Sheet: "Properties in Boston"                                    │
│    Columns: Address, Status, Type, Beds, Baths, Sqft, Year,        │
│             Price, $/sqft, Rent, Days on Mkt, List Date            │
│    Rows: 5 properties                                               │
│    ✓ Saved: property_list_Boston_*.xlsx (4.2K)                     │
│                                                                     │
│  Output Format 3: HTML                                              │
│    Card-based layout with 5 property cards                          │
│    ✓ Saved: property_list_Boston_*.html (2.9K)                     │
│                                                                     │
│  Total Files: 3                                                     │
│  Use Case: Quick property screening                                 │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│     PATH B: REPORT TYPE 2 - DETAILED ANALYSIS (FOR EACH PROPERTY)  │
│     路径B: 报告类型2 - 详细分析（每个房源）                             │
├─────────────────────────────────────────────────────────────────────┤
│  FOR EACH PropertyData in List:                                     │
│                                                                     │
│  STEP 3B.1: BUILD CASHFLOW REQUEST                                  │
│  ────────────────────────────────────────────                       │
│  Module: buildCashflowRequest()                                     │
│  Action: Convert PropertyData → CashflowRequest                     │
│                                                                     │
│  Map fields:                                                        │
│    • address, city, state, zip                                      │
│    • fmv (estimatedValue)                                           │
│    • offerPrice (listPrice)                                         │
│    • grossRentsAnnual (monthlyRent × 12)                            │
│                                                                     │
│  Calculate default values:                                          │
│    • numberOfUnits = propertyType.contains("Multi") ? 2 : 1         │
│    • propertyTaxes = listPrice × 0.01                               │
│    • insurance = listPrice × 0.003                                  │
│    • associationFees = propertyType.contains("Condo") ? 3600 : 0    │
│    • firstPrincipal = listPrice × 0.75 (75% LTV)                    │
│    • firstRateAnnual = 0.0675 (6.75%)                               │
│    • firstAmortYears = 30                                           │
│    • repairs = listPrice × 0.015                                    │
│    • lenderFee = firstPrincipal × 0.01                              │
│    • brokerFee = listPrice × 0.025                                  │
│    • transferTax = listPrice × 0.01                                 │
│    • ...40+ parameters total                                        │
│                                                                     │
│  Result: CashflowRequest object                                     │
│          ⬇                                                          │
│                                                                     │
│  STEP 3B.2: RUN CASHFLOW ANALYSIS                                   │
│  ────────────────────────────────────────                           │
│  Module: CashflowService.analyze()                                  │
│  Action: Calculate all investment metrics                           │
│                                                                     │
│  Sub-step 1: CALCULATE PURCHASE COSTS                               │
│    • Real Purchase Price (RPP)                                      │
│    • Total Acquisition Costs                                        │
│    • Cash to Close                                                  │
│    • Loan Amount                                                    │
│                                                                     │
│  Sub-step 2: CALCULATE YEAR 1 INCOME                                │
│    • Gross Scheduled Income (GSI)                                   │
│    • Vacancy Loss                                                   │
│    • Effective Gross Income (EGI)                                   │
│    • Total Income Year 1                                            │
│                                                                     │
│  Sub-step 3: CALCULATE YEAR 1 EXPENSES                              │
│    • Management Fee                                                 │
│    • Repairs & Maintenance                                          │
│    • Property Taxes                                                 │
│    • Insurance                                                      │
│    • Utilities (electric, gas, water)                               │
│    • Association Fees (if condo)                                    │
│    • Other Operating Expenses                                       │
│    • Total Operating Expenses                                       │
│                                                                     │
│  Sub-step 4: CALCULATE YEAR 1 NOI & RATIOS                          │
│    • Net Operating Income (NOI) = EGI - Operating Expenses          │
│    • Operating Expense Ratio = Expenses / EGI                       │
│    • Expense to Income Ratio                                        │
│                                                                     │
│  Sub-step 5: CALCULATE DEBT SERVICE                                 │
│    • Monthly Payment (P&I)                                          │
│    • Annual Debt Service                                            │
│    • Year 1 Interest Paid                                           │
│    • Year 1 Principal Paid (Mortgage Paydown)                       │
│                                                                     │
│  Sub-step 6: CALCULATE CASH FLOW & RETURNS                          │
│    • Cash Flow Before Tax = NOI - Debt Service                      │
│    • Cash on Cash Return = Cash Flow / Cash to Close                │
│                                                                     │
│  Sub-step 7: CALCULATE PROPERTY METRICS                             │
│    • Cap Rate = NOI / Purchase Price                                │
│    • Gross Rent Multiplier (GRM)                                    │
│    • Debt Service Coverage Ratio (DSCR) = NOI / Debt Service        │
│    • Break-Even Ratio                                               │
│    • Loan-to-Value Ratio (LTV)                                      │
│                                                                     │
│  Sub-step 8: 10-YEAR PROJECTION LOOP                                │
│    FOR year = 1 to 10:                                              │
│      • Grow rents by rentGrowth (3%)                                │
│      • Grow expenses by expenseGrowth (2.5%)                        │
│      • Appreciate property by annualAppreciation (4%)               │
│      • Calculate loan amortization                                  │
│      • Calculate year's NOI                                         │
│      • Calculate year's cash flow                                   │
│      • Store in projection array                                    │
│    END FOR                                                          │
│                                                                     │
│  Sub-step 9: CALCULATE EXIT SCENARIO                                │
│    • Year 10 Property Value                                         │
│    • Exit Costs (6% of sale price)                                  │
│    • Remaining Loan Balance                                         │
│    • Net Sale Proceeds                                              │
│                                                                     │
│  Sub-step 10: CALCULATE ADVANCED METRICS                            │
│    • IRR (Internal Rate of Return)                                  │
│      - Use iterative Newton's method                                │
│      - Consider: initial investment, annual cash flows, exit        │
│    • NPV (Net Present Value)                                        │
│    • Equity Multiple = Total Return / Initial Investment            │
│    • Profitability Index                                            │
│    • Modified IRR                                                   │
│    • Average Annual Return                                          │
│    • Cumulative Cash Flow                                           │
│    • Total Appreciation                                             │
│    • Total Mortgage Paydown (10 years)                              │
│    • Total Return                                                   │
│                                                                     │
│  Result: CashflowResponse object                                    │
│    • summary (37 metrics)                                           │
│    • projection (10 years × 12+ fields)                             │
│          ⬇                                                          │
│                                                                     │
│  STEP 3B.3: GENERATE DETAILED REPORTS                               │
│  ────────────────────────────────────────                           │
│                                                                     │
│  Output Format 1: JSON                                              │
│    {                                                                │
│      "propertyInfo": { ...14 fields... },                           │
│      "cashflowRequest": { ...40+ fields... },                       │
│      "cashflowAnalysis": {                                          │
│        "summary": { ...37 metrics... },                             │
│        "projection": [ ...10 years... ]                             │
│      },                                                             │
│      "timestamp": "..."                                             │
│    }                                                                │
│    ✓ Saved: detailed_property_N_*.json (8.0K)                      │
│                                                                     │
│  Output Format 2: Excel (2 sheets)                                  │
│    Sheet 1: "Property Info"                                         │
│      • Property Information section                                 │
│      • Investment Summary section (key metrics)                     │
│    Sheet 2: "10-Year Projection"                                    │
│      • Year-by-year financial data                                  │
│      • Income, Expenses, NOI, Cash Flow, Value, Balance             │
│    ✓ Saved: detailed_property_N_*.xlsx (5.5K)                      │
│                                                                     │
│  Total Files per Property: 2                                        │
│  Total Files for 5 Properties: 10                                   │
│  Use Case: Deep investment analysis                                 │
└─────────────────────────────────────────────────────────────────────┘
                            ⬇
┌─────────────────────────────────────────────────────────────────────┐
│                    FINAL OUTPUT                                     │
│                    最终输出                                           │
├─────────────────────────────────────────────────────────────────────┤
│  Total Files Generated: 13                                          │
│                                                                     │
│  Report Type 1 (List):                                              │
│    ✓ property_list_Boston_*.json   (2.1K)                          │
│    ✓ property_list_Boston_*.xlsx   (4.2K)                          │
│    ✓ property_list_Boston_*.html   (2.9K)                          │
│                                                                     │
│  Report Type 2 (Detailed × 5):                                      │
│    ✓ detailed_property_1_*.json    (8.0K)                          │
│    ✓ detailed_property_1_*.xlsx    (5.5K)                          │
│    ✓ detailed_property_2_*.json    (8.0K)                          │
│    ✓ detailed_property_2_*.xlsx    (5.5K)                          │
│    ✓ detailed_property_3_*.json    (8.0K)                          │
│    ✓ detailed_property_3_*.xlsx    (5.5K)                          │
│    ✓ detailed_property_4_*.json    (8.0K)                          │
│    ✓ detailed_property_4_*.xlsx    (5.5K)                          │
│    ✓ detailed_property_5_*.json    (8.0K)                          │
│    ✓ detailed_property_5_*.xlsx    (5.5K)                          │
│                                                                     │
│  User Workflow:                                                     │
│    1. Review property_list_*.xlsx → Screen candidates              │
│    2. Open detailed_property_N_*.xlsx → Deep analysis              │
│    3. Compare IRR, Equity Multiple, Cash Flow → Make decision       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔍 详细步骤说明

### **Step 1: API Data Retrieval（API数据获取）**

**模块：** `RapidApiGenericClient.java`

**流程：**
```java
// 1. 构建API请求
String endpoint = "/properties/v3/list";
Map<String, String> params = new HashMap<>();
params.put("city", "Boston");
params.put("state_code", "MA");
params.put("status", "for_sale");
params.put("limit", "5");

// 2. 调用API
String response = rapidApiClient.get(endpoint, params);

// 3. 解析JSON响应
ObjectMapper mapper = new ObjectMapper();
PropertyData[] properties = mapper.readValue(response, PropertyData[].class);

// 4. 返回房源列表
return Arrays.asList(properties);
```

**数据示例：**
```json
{
  "property_id": "M1234567890",
  "address": {
    "line": "123 Commonwealth Ave",
    "city": "Boston",
    "state": "MA",
    "postal_code": "02215"
  },
  "list_price": 850000,
  "beds": 3,
  "baths": 2,
  "sqft": 1650,
  "year_built": 2016,
  "property_type": "Condo",
  "status": "for_sale",
  "days_on_market": 39,
  "list_date": "2025-09-13"
}
```

---

### **Step 2: Data Parsing（数据解析）**

**模块：** `PropertyData.java`, `Jackson ObjectMapper`

**流程：**
```java
// 将API响应转换为Java对象
public class PropertyData {
    public String address;
    public String city;
    public String state;
    public String zipCode;
    public String status;           // for_sale, pending, sold
    public double listPrice;
    public double estimatedValue;
    public int bedrooms;
    public double bathrooms;
    public int sqft;
    public int yearBuilt;
    public String propertyType;     // Condo, Multi-Family, etc.
    public double monthlyRent;
    public int daysOnMarket;
    public String listingDate;
}
```

---

### **Step 3A: Generate Property List Report（生成房源列表报告）**

**模块：** `TwoTypeReportsDemo.generatePropertyListJson/Excel/Html()`

**流程：**

1. **JSON生成**
```java
PropertyListReport report = new PropertyListReport();
report.area = city + ", " + state;
report.totalProperties = properties.size();
report.properties = properties;

mapper.writerWithDefaultPrettyPrinter()
      .writeValue(new File(filename), report);
```

2. **Excel生成**
```java
XSSFWorkbook workbook = new XSSFWorkbook();
Sheet sheet = workbook.createSheet("Properties in " + city);

// 创建表头
Row headerRow = sheet.createRow(0);
headerRow.createCell(0).setCellValue("Address");
headerRow.createCell(1).setCellValue("Status");
// ...更多列

// 填充数据
for (PropertyData prop : properties) {
    Row row = sheet.createRow(rowNum++);
    row.createCell(0).setCellValue(prop.address);
    row.createCell(1).setCellValue(prop.status);
    // ...更多数据
}

workbook.write(new FileOutputStream(filename));
```

3. **HTML生成**
```java
StringBuilder html = new StringBuilder();
html.append("<html><head><style>...</style></head><body>");
html.append("<h1>Property List - " + city + "</h1>");

for (PropertyData prop : properties) {
    html.append("<div class='property-card'>");
    html.append("<h3>" + prop.address + "</h3>");
    html.append("<p>Status: " + prop.status + "</p>");
    // ...更多HTML
    html.append("</div>");
}

html.append("</body></html>");
Files.write(Paths.get(filename), html.toString().getBytes());
```

---

### **Step 3B: Generate Detailed Analysis Report（生成详细分析报告）**

**模块：** `CashflowService.java`, `TwoTypeReportsDemo`

#### **Sub-step 3B.1: Build Cashflow Request**

```java
private static CashflowRequest buildCashflowRequest(PropertyData prop) {
    CashflowRequest req = new CashflowRequest();
    
    // 基本信息
    req.address = prop.address;
    req.city = prop.city;
    req.state = prop.state;
    req.zip = prop.zipCode;
    
    // 价格和估值
    req.fmv = prop.estimatedValue;
    req.offerPrice = prop.listPrice;
    req.annualAppreciation = 0.04;  // 4%
    
    // 收入
    req.grossRentsAnnual = prop.monthlyRent * 12;
    req.numberOfUnits = prop.propertyType.contains("Multi") ? 2 : 1;
    req.parkingAnnual = 600.0;
    req.laundryVendingAnnual = 300.0;
    
    // 费用率
    req.vacancyRate = 0.05;      // 5%
    req.managementRate = 0.08;   // 8%
    req.repairsRate = 0.05;      // 5%
    
    // 固定费用
    req.propertyTaxes = prop.listPrice * 0.01;
    req.insurance = prop.listPrice * 0.003;
    req.associationFees = prop.propertyType.contains("Condo") ? 3600.0 : 0.0;
    
    // 贷款
    req.firstPrincipal = prop.listPrice * 0.75;  // 75% LTV
    req.firstRateAnnual = 0.0675;                // 6.75%
    req.firstAmortYears = 30;
    
    // 关闭成本
    req.repairs = prop.listPrice * 0.015;
    req.lenderFee = req.firstPrincipal * 0.01;
    req.brokerFee = prop.listPrice * 0.025;
    // ...更多参数
    
    return req;
}
```

#### **Sub-step 3B.2: Run Cashflow Analysis**

```java
public CashflowResponse analyze(CashflowRequest req) {
    CashflowResponse resp = new CashflowResponse();
    Summary s = new Summary();
    
    // 1. 购买价格和成本
    s.rpp = calculateRPP(req);
    s.cashToClose = calculateCashToClose(req);
    
    // 2. 收入计算
    s.gsiY1 = calculateGSI(req);
    s.vacancyY1 = s.gsiY1 * req.vacancyRate;
    s.egiY1 = s.gsiY1 - s.vacancyY1;
    
    // 3. 费用计算
    s.managementY1 = calculateManagement(req, s.egiY1);
    s.totalExpensesY1 = calculateTotalExpenses(req, s);
    
    // 4. NOI计算
    s.noiY1 = s.egiY1 - s.totalExpensesY1;
    
    // 5. 贷款还款
    s.monthlyPaymentFirst = calculateMonthlyPayment(req);
    s.annualDebtServiceY1 = s.monthlyPaymentFirst * 12;
    
    // 6. 现金流
    s.cashFlowBeforeTaxY1 = s.noiY1 - s.annualDebtServiceY1;
    
    // 7. 比率计算
    s.capRatePPY1 = s.noiY1 / s.rpp;
    s.dscrY1 = s.noiY1 / s.annualDebtServiceY1;
    s.cashOnCashY1 = s.cashFlowBeforeTaxY1 / s.cashToClose;
    
    // 8. 10年预测
    List<YearRow> projection = new ArrayList<>();
    for (int year = 1; year <= 10; year++) {
        YearRow yr = calculateYear(req, year, prevBalance);
        projection.add(yr);
    }
    
    // 9. 退出场景
    s.saleProceedsNet = calculateExitProceeds(req, projection);
    
    // 10. 高级指标
    s.irr = calculateIRR(cashFlows);
    s.equityMultiple = calculateEquityMultiple(req, s);
    s.npv = calculateNPV(cashFlows, discountRate);
    
    resp.summary = s;
    resp.projection = projection;
    
    return resp;
}
```

#### **核心计算公式示例：**

**1. Real Purchase Price (RPP):**
```java
double rpp = offerPrice + repairs + repairsContingency + 
             lenderFee + brokerFee + inspections + appraisals + 
             transferTax + legalClose + otherClosingCosts;
```

**2. Cash to Close:**
```java
double downPayment = rpp - firstPrincipal;
double cashToClose = downPayment + repairs + repairsContingency + 
                     lenderFee + brokerFee + inspections + 
                     appraisals + transferTax + legalClose + 
                     otherClosingCosts;
```

**3. Monthly Payment (P&I):**
```java
double monthlyRate = annualRate / 12;
int totalPayments = amortYears * 12;
double monthlyPayment = principal * 
    (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) / 
    (Math.pow(1 + monthlyRate, totalPayments) - 1);
```

**4. IRR Calculation (Newton's Method):**
```java
double irr = 0.1; // Initial guess
for (int i = 0; i < 100; i++) {
    double npv = calculateNPV(cashFlows, irr);
    double derivative = calculateDerivative(cashFlows, irr);
    double newIrr = irr - npv / derivative;
    
    if (Math.abs(newIrr - irr) < 0.0001) {
        return newIrr;
    }
    irr = newIrr;
}
```

**5. Equity Multiple:**
```java
double totalReturn = cumulativeCashFlow + saleProceedsNet;
double equityMultiple = totalReturn / cashToClose;
```

---

## 📊 数据流转示意

```
PropertyData (API)
    │
    ├─→ [报告类型1] → PropertyListReport
    │                     │
    │                     ├─→ JSON (2.1K)
    │                     ├─→ Excel (4.2K)
    │                     └─→ HTML (2.9K)
    │
    └─→ [报告类型2] → CashflowRequest
                          │
                          ↓
                     CashflowService.analyze()
                          │
                          ↓
                     CashflowResponse
                          │
                          ├─→ JSON (8.0K)
                          └─→ Excel (5.5K)
```

---

## ⏱️ 性能指标

| 操作 | 时间 | 备注 |
|------|------|------|
| API调用 | ~500ms | 依赖网络 |
| 数据解析 | ~10ms | Jackson |
| 单个房源Cashflow计算 | ~50ms | 包含IRR迭代 |
| 房源列表报告生成 | ~100ms | 3个文件 |
| 详细分析报告生成 | ~200ms | 2个文件 |
| **总计（5个房源）** | **~2-3秒** | 13个文件 |

---

## 🎯 关键设计决策

### **1. 为什么生成两种报告？**
- **筛选阶段需要快速浏览** → 房源列表报告（简单、快速）
- **决策阶段需要深度分析** → 详细分析报告（复杂、专业）
- **模拟真实投资流程** → 先筛选后分析

### **2. 为什么使用多种格式？**
- **JSON** - 机器可读，用于存储和API
- **Excel** - 人类可读，可编辑，专业人士习惯
- **HTML** - 网页展示，易于分享
- **PDF** - 打印和归档

### **3. 为什么计算37个指标？**
- **全面性** - 覆盖所有投资维度
- **专业性** - 符合行业标准
- **灵活性** - 不同投资者关注不同指标

### **4. 为什么做10年预测？**
- **长期视角** - 房地产是长期投资
- **趋势可见** - 展示租金增长、升值、本金偿还
- **IRR计算** - 需要完整的现金流序列

---

## 🔧 技术实现要点

### **1. API集成**
```java
// 使用Apache HttpClient
CloseableHttpClient httpClient = HttpClients.createDefault();
HttpGet request = new HttpGet(url);
request.addHeader("X-RapidAPI-Key", apiKey);
CloseableHttpResponse response = httpClient.execute(request);
String jsonResponse = EntityUtils.toString(response.getEntity());
```

### **2. JSON处理**
```java
// 使用Jackson
ObjectMapper mapper = new ObjectMapper();
PropertyData[] properties = mapper.readValue(json, PropertyData[].class);
```

### **3. Excel生成**
```java
// 使用Apache POI
XSSFWorkbook workbook = new XSSFWorkbook();
Sheet sheet = workbook.createSheet("Sheet1");
Row row = sheet.createRow(0);
Cell cell = row.createCell(0);
cell.setCellValue("Value");
```

### **4. IRR计算**
```java
// 使用Newton's Method迭代
double irr = 0.1; // Initial guess
while (Math.abs(npv) > 0.0001) {
    irr = irr - npv / derivative;
    npv = calculateNPV(cashFlows, irr);
}
```

---

## 📁 文件组织

```
output/
├── property_list_Boston_20251022_013632.json      ← 列表JSON
├── property_list_Boston_20251022_013632.xlsx      ← 列表Excel
├── property_list_Boston_20251022_013633.html      ← 列表HTML
├── detailed_property_1_20251022_013633.json       ← 房源1详细JSON
├── detailed_property_1_20251022_013633.xlsx       ← 房源1详细Excel
├── detailed_property_2_20251022_013633.json       ← 房源2详细JSON
├── detailed_property_2_20251022_013633.xlsx       ← 房源2详细Excel
├── detailed_property_3_20251022_013633.json       ← 房源3详细JSON
├── detailed_property_3_20251022_013633.xlsx       ← 房源3详细Excel
├── detailed_property_4_20251022_013633.json       ← 房源4详细JSON
├── detailed_property_4_20251022_013633.xlsx       ← 房源4详细Excel
├── detailed_property_5_20251022_013633.json       ← 房源5详细JSON
└── detailed_property_5_20251022_013633.xlsx       ← 房源5详细Excel

Total: 13 files
```

---

## 🚀 完整运行示例

```bash
# 进入项目目录
cd realtyinus

# 运行系统
mvn exec:java -Dexec.mainClass="com.ireia.realty.TwoTypeReportsDemo" \
  -Dexec.classpathScope=test -q

# 输出：
# === Two Types of Reports Demo ===
# Found 5 properties in Boston, MA
# 
# === REPORT TYPE 1: Property List Report ===
# ✓ Property list JSON: output/property_list_Boston_*.json
# ✓ Property list Excel: output/property_list_Boston_*.xlsx
# ✓ Property list HTML: output/property_list_Boston_*.html
# 
# === REPORT TYPE 2: Detailed Analysis Reports ===
# Analyzing property 1: 123 Commonwealth Ave
#   ✓ Detailed JSON: output/detailed_property_1_*.json
#   ✓ Detailed Excel: output/detailed_property_1_*.xlsx
#   → IRR: 4.54% | Cap Rate: 3.30% | Cash Flow: $-22,036
# ...
# 
# === Demo Complete ===
```

---

## ✅ 总结

**系统工作流程核心步骤：**

1. **输入** → 城市、州、状态
2. **获取** → 调用RealtyInUS API
3. **解析** → JSON转Java对象
4. **分支** → 两种报告类型
   - **路径A** - 房源列表（快速浏览）
   - **路径B** - 详细分析（每个房源）
5. **计算** → Cashflow引擎（37个指标 + 10年预测）
6. **输出** → 多格式报告（JSON/Excel/HTML）

**关键特性：**
- ✅ 端到端自动化
- ✅ 真实API数据
- ✅ 专业财务分析
- ✅ 多维度报告
- ✅ 灵活可扩展

这就是整个系统的完整workflow！🎉

