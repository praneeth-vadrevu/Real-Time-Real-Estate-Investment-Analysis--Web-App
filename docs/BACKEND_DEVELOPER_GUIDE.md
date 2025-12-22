# Developer Guide - Real Estate Backend Service

> **Version:** 1.0.0  
> **Last Updated:** December 2025  
> **Audience:** Developers, Contributors

---

## Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Development Environment Setup](#2-development-environment-setup)
3. [Code Structure](#3-code-structure)
4. [API Reference](#4-api-reference)
5. [Core Components](#5-core-components)
6. [Data Models](#6-data-models)
7. [Business Logic](#7-business-logic)
8. [Testing](#8-testing)
9. [Code Style Guidelines](#9-code-style-guidelines)
10. [Contributing](#10-contributing)
11. [Generating Documentation](#11-generating-documentation)

---

## 1. Architecture Overview

### System Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                    React Frontend (Port 3000)                        │ │
│  │    PropertyForm.tsx │ SearchPage.tsx │ PropertyMap.tsx              │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │ REST API (JSON)
                               ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                           BACKEND LAYER (Port 8080)                       │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                         CONTROLLER LAYER                             │ │
│  │  PropertyController │ CashflowController │ GeoController            │ │
│  │  /api/properties/*  │ /api/analysis/*    │ /api/geo/*               │ │
│  └─────────────────────────────┬───────────────────────────────────────┘ │
│                                │                                          │
│  ┌─────────────────────────────▼───────────────────────────────────────┐ │
│  │                          SERVICE LAYER                               │ │
│  │  ZillowService │ CashflowService │ GoogleApi31Service               │ │
│  │  - API calls   │ - Business logic│ - Geocoding                      │ │
│  │  - Data parse  │ - Calculations  │ - Place search                   │ │
│  └─────────────────────────────┬───────────────────────────────────────┘ │
│                                │                                          │
│  ┌─────────────────────────────▼───────────────────────────────────────┐ │
│  │                           MODEL LAYER                                │ │
│  │  EnrichedProperty │ SearchCard │ CashflowRequest │ CashflowResponse │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────┬───────────────────────────────────────┘
                                   │ HTTPS
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                          EXTERNAL SERVICES                                │
│  ┌───────────────────────┐    ┌────────────────────────────────────────┐ │
│  │      Zillow API       │    │           Google API 31                │ │
│  │  (RapidAPI hosted)    │    │         (RapidAPI hosted)              │ │
│  │                       │    │                                        │ │
│  │  - Property search    │    │  - Place search                        │ │
│  │  - Property details   │    │  - Geocoding                           │ │
│  │  - Estimates          │    │  - Radius search                       │ │
│  │  - Comps              │    │                                        │ │
│  └───────────────────────┘    └────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────┘
```

### Design Patterns Used

- MVC - Controller-Service-Model separation
- DTO - Data Transfer Objects for API requests/responses
- Dependency Injection - Spring-managed beans
- Builder - For constructing complex objects
- Strategy - For different calculation methods

---

## 2. Development Environment Setup

### Prerequisites

```bash
# Required versions
Java:   17+
Maven:  3.8+
Git:    2.30+
```

### IDE Setup

#### IntelliJ IDEA (Recommended)
1. Open IntelliJ IDEA
2. File → Open → Select `googlemapv2` folder
3. Wait for Maven to import dependencies
4. Mark `src/main/java` as Sources Root
5. Mark `src/test/java` as Test Sources Root

#### VS Code
1. Install extensions:
   - Extension Pack for Java
   - Spring Boot Extension Pack
2. Open the `googlemapv2` folder
3. Wait for Java project recognition

### Environment Configuration

Create a `.env` file (do NOT commit):

```bash
# .env (add to .gitignore)
RAPIDAPI_KEY=your-api-key-here
```

### Running in Development Mode

```bash
# Hot reload enabled
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dspring.devtools.restart.enabled=true"

# Debug mode (port 5005)
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=5005"
```

---

## 3. Code Structure

### Package Organization

```
src/main/java/com/example/
├── map/                           # Application core
│   ├── Application.java           # Spring Boot main class
│   ├── config/
│   │   └── CorsConfig.java        # CORS configuration
│   └── geo/
│       ├── GeoController.java     # Geo REST endpoints
│       └── GoogleApi31Service.java # Google API integration
│
├── realestate/                    # Real estate domain
│   ├── controller/
│   │   └── PropertyController.java # Property REST endpoints
│   ├── model/
│   │   ├── EnrichedProperty.java  # Full property data model
│   │   └── SearchCard.java        # Search result model
│   └── service/
│       └── ZillowService.java     # Zillow API integration
│
└── analysis/                      # Investment analysis
    ├── controller/
    │   └── CashflowController.java # Analysis REST endpoints
    ├── dto/
    │   ├── CashflowRequest.java   # Input DTO
    │   └── CashflowResponse.java  # Output DTO
    └── service/
        └── CashflowService.java   # Cashflow calculations
```

### Naming Conventions

- Classes: PascalCase (e.g., `CashflowService`)
- Methods: camelCase (e.g., `analyzeProperty()`)
- Constants: UPPER_SNAKE (e.g., `MAX_RETRY_COUNT`)
- Variables: camelCase (e.g., `propertyPrice`)
- Packages: lowercase (e.g., `com.example.analysis`)

---

## 4. API Reference

### REST Endpoints Summary

#### Property Controller (`/api/properties`)

```java
/**
 * Search properties by location
 * @param location City, state, or ZIP code
 * @param status   Listing status (for_sale, for_rent, sold)
 * @param page     Page number for pagination
 * @return List of SearchCard objects
 */
@GetMapping("/search")
public List<SearchCard> searchProperties(
    @RequestParam String location,
    @RequestParam(required = false) String status,
    @RequestParam(defaultValue = "1") Integer page
);

/**
 * Get enriched property details by ZPID
 * @param zpid Zillow Property ID
 * @return EnrichedProperty with full details
 */
@GetMapping("/{zpid}")
public EnrichedProperty getPropertyDetails(@PathVariable String zpid);
```

#### Cashflow Controller (`/api/analysis`)

```java
/**
 * Perform cashflow analysis on a property investment
 * @param request CashflowRequest containing all input parameters
 * @return CashflowResponse with summary and projections
 */
@PostMapping("/cashflow")
public CashflowResponse analyzeCashflow(@RequestBody CashflowRequest request);
```

#### Geo Controller (`/api/geo`)

```java
/**
 * Text-based place search
 * @param text     Search keyword
 * @param place    Place name
 * @param city     City name
 * @param state    State code
 * @param country  Country name
 * @param postcode ZIP/postal code
 * @return JSON response from Google API
 */
@GetMapping("/text")
public JsonNode textSearch(
    @RequestParam(required = false) String text,
    @RequestParam(required = false) String place,
    @RequestParam(required = false) String city,
    @RequestParam(required = false) String state,
    @RequestParam(required = false) String country,
    @RequestParam(required = false) String postcode
);

/**
 * Radius-based search around a point
 * @param lat    Latitude of center point
 * @param lon    Longitude of center point
 * @param radius Search radius in meters
 * @param text   Optional search keyword
 * @return JSON response from Google API
 */
@GetMapping("/circle")
public JsonNode circleSearch(
    @RequestParam double lat,
    @RequestParam double lon,
    @RequestParam(defaultValue = "1000") int radius,
    @RequestParam(required = false) String text
);
```

---

## 5. Core Components

### 5.1 Application Entry Point

```java
/**
 * Main Spring Boot application class.
 * Configures component scanning across all packages.
 */
@SpringBootApplication
@ComponentScan(basePackages = {
    "com.example.map",
    "com.example.realestate",
    "com.example.analysis"
})
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### 5.2 Zillow Service

The `ZillowService` handles all Zillow API interactions:

```java
/**
 * Service for interacting with Zillow API via RapidAPI.
 * Provides methods for property search, details, and enrichment.
 */
@Service
public class ZillowService {
    
    @Value("${zillow.rapidapi.host}")
    private String host;
    
    @Value("${zillow.rapidapi.key}")
    private String apiKey;
    
    /**
     * Search properties by location
     * @param location City, state, or ZIP code
     * @param status   Listing status filter
     * @param page     Page number
     * @return List of SearchCard results
     */
    public List<SearchCard> searchProperties(String location, String status, Integer page);
    
    /**
     * Get full enriched property data
     * Aggregates data from multiple API endpoints:
     * - Property details
     * - Tax history
     * - Zestimate
     * - Rent estimate
     * - Comparables
     * - Images
     * 
     * @param zpid Zillow Property ID
     * @return EnrichedProperty with all available data
     */
    public EnrichedProperty getEnrichedProperty(String zpid);
}
```

### 5.3 Cashflow Service

The core business logic for investment analysis:

```java
/**
 * Core calculator for investment cashflow analysis.
 * Implements Year-1 KPIs and multi-year projections.
 * 
 * Features:
 * - NOI (Net Operating Income) calculation
 * - Debt service with optional interest-only periods
 * - Cap rate analysis
 * - Cash-on-cash returns
 * - IRR calculation using Newton-Raphson method
 * - Multi-year projections with growth rates
 */
public class CashflowService {
    
    /**
     * Main analysis method
     * @param request Input parameters for analysis
     * @return Complete analysis with summary and projections
     */
    public CashflowResponse analyze(CashflowRequest request);
}
```

---

## 6. Data Models

### 6.1 CashflowRequest (Input DTO)

```java
/**
 * Input DTO for investment cashflow analysis.
 * All monetary values in same currency (USD).
 * Percentage fields as decimals (e.g., 0.05 for 5%).
 */
public class CashflowRequest {
    
    // === IDENTIFICATION ===
    public String address;              // Property address
    public String city;                 // City
    public String state;                // State code
    public String zip;                  // ZIP code
    
    // === VALUATION ===
    public Double fmv;                  // Fair Market Value
    public Double offerPrice;           // Purchase price
    public Double annualAppreciation;   // Annual appreciation rate (0.03 = 3%)
    
    // === INCOME (Annual) ===
    public Double grossRentsAnnual;     // Total annual rent
    public Integer numberOfUnits;       // Number of units
    public Double parkingAnnual;        // Parking income
    public Double storageAnnual;        // Storage income
    public Double laundryVendingAnnual; // Laundry/vending income
    public Double otherIncomeAnnual;    // Other income
    
    // === VACANCY & MANAGEMENT (Rates) ===
    public Double vacancyRate;          // Vacancy rate (0.05 = 5%)
    public Double managementRate;       // Management fee rate
    public Double repairsRate;          // Repairs rate (applied to gross rent)
    
    // === OPERATING EXPENSES (Annual flat amounts) ===
    public Double propertyTaxes;        // Annual property tax
    public Double insurance;            // Annual insurance
    public Double electricity;          // Annual electricity
    public Double gas;                  // Annual gas
    public Double waterSewer;           // Annual water/sewer
    public Double cable;                // Annual cable/internet
    public Double caretaking;           // Caretaking costs
    public Double advertising;          // Advertising costs
    public Double associationFees;      // HOA fees
    public Double pest;                 // Pest control
    public Double security;             // Security costs
    public Double trash;                // Trash removal
    public Double misc;                 // Miscellaneous
    public Double commonAreaMaintenance;// CAM fees
    public Double capitalImprovements;  // CapEx reserve
    public Double accounting;           // Accounting fees
    public Double legal;                // Legal fees
    public Double badDebts;             // Bad debt allowance
    public Double evictions;            // Eviction costs
    public Double otherExpenses;        // Other expenses
    
    // === FINANCING - Primary Loan ===
    public Double firstPrincipal;       // Loan amount
    public Double firstRateAnnual;      // APR (0.07 = 7%)
    public Integer firstAmortYears;     // Amortization term
    public Integer firstInterestOnlyYears; // Interest-only years
    
    // === FINANCING - Secondary Loan ===
    public Double secondPrincipal;      // 2nd loan amount
    public Double secondRateAnnual;     // 2nd loan APR
    public Integer secondAmortYears;    // 2nd loan term
    
    // === OTHER FINANCING ===
    public Double otherMonthlyFinancingCosts; // Other monthly costs
    
    // === CLOSING COSTS ===
    public Double repairs;              // Initial repairs
    public Double repairsContingency;   // Repair contingency
    public Double lenderFee;            // Lender fees
    public Double brokerFee;            // Broker fees
    public Double environmentals;       // Environmental reports
    public Double inspections;          // Inspection costs
    public Double appraisals;           // Appraisal costs
    public Double transferTax;          // Transfer tax
    public Double legalClose;           // Legal (closing)
    public Double otherClosingCosts;    // Other closing costs
    
    // === PROJECTION SETTINGS ===
    public Integer holdYears;           // Holding period
    public Double rentGrowth;           // Annual rent growth
    public Double expenseGrowth;        // Annual expense growth
    public Double exitCostRate;         // Selling cost rate
    
    // === OPTIONS ===
    public String managementBase;       // "EGI" or "GROSS_RENTS"
}
```

### 6.2 CashflowResponse (Output DTO)

```java
/**
 * Output DTO for cashflow analysis results.
 */
public class CashflowResponse {
    
    public Summary summary;             // Key metrics
    public List<YearRow> projection;    // Year-by-year data
    
    /**
     * Summary metrics for the investment
     */
    public static class Summary {
        // === PRICING ===
        public Double rpp;              // Real Purchase Price
        public Double cashToClose;      // Cash required at closing
        
        // === YEAR-1 INCOME/EXPENSE ===
        public Double totalIncomeY1;    // Total income
        public Double vacancyLossY1;    // Vacancy loss
        public Double egiY1;            // Effective Gross Income
        public Double totalExpensesY1;  // Total expenses
        public Double noiY1;            // Net Operating Income
        
        // === DEBT METRICS ===
        public Double annualDebtServiceY1; // Annual debt payment
        public Double dscrY1;           // Debt Service Coverage Ratio
        
        // === PROFITABILITY ===
        public Double capRatePPY1;      // Cap rate (Purchase Price)
        public Double capRateFMVY1;     // Cap rate (FMV)
        public Double grmY1;            // Gross Rent Multiplier
        public Double avgRentPerUnitY1; // Average rent per unit
        public Double monthlyProfitY1;  // Monthly profit
        public Double cashflowPerUnitPerMonthY1; // CF per unit/month
        
        // === LEVERAGE ===
        public Double ltvFMV;           // Loan-to-Value (FMV)
        public Double ltppPP;           // Loan-to-Price (PP)
        
        // === RETURNS ===
        public Double cashOnCashY1;     // Cash-on-Cash Return
        public Double equityROIY1;      // Equity ROI
        public Double appreciationROIY1;// Appreciation ROI
        public Double totalROIY1;       // Total ROI
        public Double forcedAppreciationROIY1; // Forced appreciation
        
        // === MULTI-YEAR ===
        public Double irr;              // Internal Rate of Return
        public Double equityMultiple;   // Equity Multiple
        public Double saleProceedsNet;  // Net proceeds at exit
    }
    
    /**
     * Yearly projection data
     */
    public static class YearRow {
        public int year;                // Year number
        public Double totalIncome;      // Total income
        public Double vacancyLoss;      // Vacancy loss
        public Double egi;              // Effective Gross Income
        public Double management;       // Management expense
        public Double repairsRateBased; // Repairs expense
        public Double totalExpenses;    // Total expenses
        public Double noi;              // Net Operating Income
        public Double debtService;      // Debt service
        public Double cashFlowBeforeTax;// Cash flow before tax
        public Double endingBalanceFirst;  // 1st loan balance
        public Double endingBalanceSecond; // 2nd loan balance
        public Double propertyValue;    // Property value
    }
}
```

### 6.3 EnrichedProperty

```java
/**
 * Comprehensive property data model.
 * Aggregates data from multiple Zillow API endpoints.
 */
public class EnrichedProperty {
    
    // === IDENTIFICATION ===
    public String zpid;                 // Zillow Property ID
    public String address;              // Full address
    public String status;               // Listing status
    public String propertyType;         // Property type
    
    // === BASIC INFO ===
    public Double price;                // List price
    public Double bedrooms;             // Number of bedrooms
    public Double bathrooms;            // Number of bathrooms
    public Double livingArea;           // Living area (sqft)
    public Double lotAreaValue;         // Lot size
    public Integer yearBuilt;           // Year built
    
    // === LOCATION ===
    public Double lat;                  // Latitude
    public Double lon;                  // Longitude
    
    // === ESTIMATES ===
    public Double zestimate;            // Zillow estimate
    public Double rentEstimate;         // Rent Zestimate
    
    // === COSTS ===
    public Double hoaMonthly;           // Monthly HOA
    public Double annualTax;            // Annual property tax
    
    // === MEDIA ===
    public String imgSrc;               // Primary image URL
    public List<String> photoUrls;      // All photo URLs
    public List<String> tour3dUrls;     // 3D tour URLs
    public List<String> floorPlanUrls;  // Floor plan URLs
    
    // === FEATURES ===
    public List<String> heating;        // Heating types
    public List<String> cooling;        // Cooling types
    public List<String> parkingFeatures;// Parking features
    
    // === COMPARABLES ===
    public Integer compsCount;          // Number of comps
    public Double compsMedianSoldPrice; // Median comp price
    public Double compsMedianPpsf;      // Median price per sqft
    
    // === DERIVED ===
    public Double pricePerSqft;         // Price per sqft
    public Double lotToBuildingRatio;   // Lot to building ratio
    
    // === LINKS ===
    public String zillowWebUrl;         // Zillow listing URL
}
```

---

## 7. Business Logic

### 7.1 Cashflow Calculation Algorithm

```java
/**
 * STEP 1: Calculate Year-1 Income Stack
 */
double totalIncomeY1 = grossRents + parking + storage + laundry + otherIncome;
double vacancyLossY1 = totalIncomeY1 * vacancyRate * -1;
double egiY1 = totalIncomeY1 + vacancyLossY1;  // Effective Gross Income

/**
 * STEP 2: Calculate Year-1 Expenses
 */
double managementY1 = managementRate * managementBase;  // Based on EGI or Gross Rents
double repairsY1 = repairsRate * grossRents;
double totalExpensesY1 = managementY1 + repairsY1 + sumOfAllOtherExpenses;
double noiY1 = egiY1 - totalExpensesY1;  // Net Operating Income

/**
 * STEP 3: Calculate Debt Service
 */
// Using amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
double annualDebtService = firstLoanPayment + secondLoanPayment + otherFinancing;
double dscrY1 = noiY1 / annualDebtService;  // Debt Service Coverage Ratio

/**
 * STEP 4: Calculate Returns
 */
double rpp = offerPrice + allClosingCosts;  // Real Purchase Price
double cashToClose = rpp - firstPrincipal - secondPrincipal;
double capRateY1 = noiY1 / offerPrice;
double cashOnCashY1 = (noiY1 - annualDebtService) / cashToClose;

/**
 * STEP 5: Multi-Year Projection
 */
for (int year = 1; year <= holdYears; year++) {
    // Grow income by rentGrowth rate
    // Grow expenses by expenseGrowth rate
    // Calculate debt service (accounting for interest-only periods)
    // Track loan balances
    // Track property appreciation
}

/**
 * STEP 6: Calculate Exit Metrics
 */
double salePrice = offerPrice * pow(1 + appreciation, holdYears);
double saleCosts = salePrice * exitCostRate;
double netSaleProceeds = salePrice - saleCosts - remainingLoanBalance;
double irr = calculateIRR(cashflows);  // Newton-Raphson method
double equityMultiple = totalDistributions / initialInvestment;
```

### 7.2 IRR Calculation (Newton-Raphson)

```java
/**
 * Calculate Internal Rate of Return using Newton-Raphson iteration.
 * 
 * NPV formula: Σ(CFt / (1+r)^t) = 0
 * 
 * @param cashflows List of cash flows (index 0 = initial investment, negative)
 * @param guess Initial guess for IRR
 * @return IRR as decimal (null if not converged)
 */
private static Double irr(List<Double> cashflows, double guess) {
    double x = guess;
    for (int i = 0; i < 50; i++) {  // Max 50 iterations
        double f = 0, df = 0;
        for (int t = 0; t < cashflows.size(); t++) {
            double ct = cashflows.get(t);
            double d = Math.pow(1 + x, t);
            f += ct / d;                              // NPV
            if (t > 0) df += -t * ct / Math.pow(1 + x, t + 1);  // Derivative
        }
        double x1 = x - f / df;  // Newton-Raphson step
        if (Math.abs(x1 - x) < 1e-7) return x1;  // Converged
        x = x1;
    }
    return null;  // Did not converge
}
```

---

## 8. Testing

### Running Tests

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=CashflowServiceTest

# Run with coverage report
mvn test jacoco:report
```

### Test Structure

```
src/test/java/com/example/
├── analysis/
│   └── service/
│       └── CashflowServiceTest.java    # Unit tests for cashflow
├── realestate/
│   └── service/
│       └── ZillowServiceTest.java      # Integration tests for Zillow
└── map/
    └── geo/
        └── GeoControllerTest.java      # API endpoint tests
```

### Writing Tests

```java
/**
 * Example test for CashflowService
 */
@Test
public void testBasicCashflowCalculation() {
    CashflowRequest request = new CashflowRequest();
    request.offerPrice = 500000.0;
    request.grossRentsAnnual = 48000.0;
    request.vacancyRate = 0.05;
    request.propertyTaxes = 6000.0;
    request.insurance = 2400.0;
    request.firstPrincipal = 400000.0;
    request.firstRateAnnual = 0.07;
    request.firstAmortYears = 30;
    request.holdYears = 10;
    
    CashflowService service = new CashflowService();
    CashflowResponse response = service.analyze(request);
    
    assertNotNull(response.summary);
    assertTrue(response.summary.noiY1 > 0);
    assertTrue(response.summary.dscrY1 > 1.0);
    assertEquals(10, response.projection.size());
}
```

---

## 9. Code Style Guidelines

### Java Style

```java
/**
 * Class-level Javadoc explaining purpose
 */
public class ExampleService {
    
    // Constants at top
    private static final int MAX_RETRIES = 3;
    
    // Instance variables
    private final HttpClient httpClient;
    
    /**
     * Constructor with dependency injection
     */
    public ExampleService(HttpClient httpClient) {
        this.httpClient = httpClient;
    }
    
    /**
     * Method-level Javadoc for public methods
     * @param param Description of parameter
     * @return Description of return value
     * @throws ExceptionType When this exception is thrown
     */
    public Result doSomething(String param) throws SomeException {
        // Implementation
    }
    
    // Private helper methods at bottom
    private void helperMethod() {
        // ...
    }
}
```

### Formatting Rules

- **Indentation:** 2 spaces (no tabs)
- **Line length:** Max 120 characters
- **Braces:** K&R style (opening brace on same line)
- **Imports:** Organized, no wildcards

---

## 10. Contributing

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature description"

# 3. Push and create PR
git push origin feature/your-feature-name
```

### Commit Message Format

```
<type>: <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---
