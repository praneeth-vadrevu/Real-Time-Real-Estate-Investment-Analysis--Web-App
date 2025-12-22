# Calculator for Cashflow Analysis

A thorough cash flow analysis calculator for real estate investment analysis that is built on Java.

## Characteristics

- **Income & Expense Calculation**: Determine the overall revenue from several sources (rent, parking, storage, etc.) and oversee different operating costs
 - **NOI Analysis**: Net Operating Income computations with management and vacancy considerations
  - **Debt Service**: Assistance with several loans with optional interest-only terms Investment    Metrics: 
      - Cap Rate (determined by FMV and purchase price)
      - Debt Service Coverage Ratio, or DSCR
      - Internal Rate of Return (IRR) and Cash-on-Cash Return
      - The Equity Multiple
      - Numerous ROI metrics;
  **Multi-Year Projections**: Project cash flows over several years with adjustable growth rates; **Exit Analysis**: Determine net sale proceeds upon exit

## Files

- `CashflowController.java` - REST API controller for exposing analysis endpoints
- `CashflowRequest.java` - Input DTO containing all investment parameters
- `CashflowResponse.java` - Output DTO with summary metrics and yearly projections
- `CashflowService.java` - Core business logic and calculation engine
- `CashflowServiceTest.java` - Comprehensive test suite

## How to Compile

```bash
cd cashflow-calculator
javac -d . CashflowRequest.java CashflowResponse.java CashflowService.java CashflowServiceTest.java CashflowController.java
```

## How to Run Tests

```bash
java com.example.analysis.service.CashflowServiceTest
```

## Test Outcomes

Each of the seven tests has a 100% success rate:

- Calculating Basic Income and NOI
- Debt Service and DSCR;
- Cap Rate; Cash-on-Cash Return and ROI;
- Multi-Year Projection;
- Full Real-World Scenario (12-unit apartment complex);
- Interest-Only Period

## Example Usage

The calculator can analyze complex real estate investment scenarios including:

- Multi-unit residential properties
- Multiple income streams (rent, parking, storage, laundry, etc.)
- Dual financing (primary and secondary loans)
- Interest-only periods
- Annual growth rates for income and expenses
- Property appreciation
- Exit cost analysis

### Sample Output

```
=== 12-UNIT APARTMENT BUILDING ANALYSIS ===
Property: 123 Main St, Boston, MA
Offer Price: $2,300,000.00
Fair Market Value: $2,500,000.00

--- YEAR 1 METRICS ---
Net Operating Income (NOI): $138,146.16
Cap Rate (Purchase Price): 6.01%
DSCR: 1.12
Cash-on-Cash Return: 2.89%

--- 10-YEAR PROJECTIONS ---
IRR (Internal Rate of Return): 15.11%
Equity Multiple: 3.57x
Net Sale Proceeds (Year 10): $1,482,401.99
```

## Package Structure

```
com.example.analysis
├── controller
│   └── CashflowController
├── dto
│   ├── CashflowRequest
│   └── CashflowResponse
└── service
    ├── CashflowService
    └── CashflowServiceTest
```

## Dependencies

- Java 8 or higher
- Spring Framework (for REST controller)

## Integration with Other Modules

This cashflow calculator can be integrated with:
- **Zillow API** module for fetching real property data
- **Google Maps API** module for location-based analysis
- **React frontend** for interactive user interface


