# Financing Fields Analysis

## Overview

The Financing section contains fields related to mortgage and financing information for property investments. This document analyzes which fields can be automatically populated from API data versus those that require user input.

## Field Analysis

### 1. First Mortgage Principal Borrowed

- **Field Name**: `firstMtgPrincipleBorrowed`
- **User Input Required**: Yes
- **Available from API**: No
- **Explanation**: The loan amount is specific to the buyer and depends on down payment, purchase price, and lender terms. This information is not available from property listing APIs.

### 2. First Mortgage Interest Rate

- **Field Name**: `firstMtgInterestRate`
- **User Input Required**: Yes
- **Available from API**: Partially
- **API Data Available**: 
  - `mortgageZHLRates.thirtyYearFixedBucket.rate` (example: 6.156%)
  - `mortgageZHLRates.fifteenYearFixedBucket.rate` (example: 5.49%)
  - `mortgageZHLRates.arm5Bucket.rate` (example: 6.133%)
- **Important Note**: These are current market rates from Zillow, not the actual rate the buyer will receive. Actual rates depend on credit score, lender, and loan terms. These market rates can be used as default values but should be editable by the user.

### 3. First Mortgage Amortization Period

- **Field Name**: `firstMtgAmortizationPeriod`
- **User Input Required**: Yes
- **Available from API**: No
- **Explanation**: The loan term is a decision made by the buyer and lender, typically 15, 20, or 30 years. This information is not available from property APIs.

### 4. First Mortgage Total Principal (Including CMHC Fees)

- **Field Name**: `firstMtgTotalPrinciple`
- **User Input Required**: Yes
- **Available from API**: No
- **Explanation**: This includes loan fees and insurance costs that are specific to the lender and buyer. These costs vary based on individual circumstances.

### 5. First Mortgage Total Monthly Payment

- **Field Name**: `firstMtgTotalMonthlyPayment`
- **User Input Required**: Yes (but can be calculated)
- **Available from API**: No
- **Calculation Method**: This value can be calculated using the standard mortgage payment formula:
  ```
  M = P * [r(1+r)^n] / [(1+r)^n - 1]
  ```
  Where:
  - M = Monthly payment
  - P = Principal borrowed
  - r = Monthly interest rate (annual rate / 12)
  - n = Total number of payments (years * 12)

### 6. Second Mortgage Interest Rate

- **Field Name**: `secondMtgInterestRate`
- **User Input Required**: Yes
- **Available from API**: No
- **Explanation**: Second mortgages are less common and have different rates. This information is not available from Zillow API.

### 7. Second Mortgage Amortization Period

- **Field Name**: `secondMtgAmortizationPeriod`
- **User Input Required**: Yes
- **Available from API**: No
- **Explanation**: The loan term for the second mortgage is a decision made by the buyer and lender.

### 8. Cash Required to Close (After Financing)

- **Field Name**: `cashRequiredToClose`
- **User Input Required**: Yes (but can be calculated)
- **Available from API**: No
- **Calculation Method**: This value can be calculated from:
  - Purchase price
  - Down payment percentage
  - Closing costs
  - Loan fees
  - Formula: `Cash Required = Down Payment + Closing Costs + Loan Fees`

## Complete Field List

### First Mortgage Fields

1. First Mortgage Principal Borrowed - User input required
2. First Mortgage Interest Rate - User input required (can use API market rate as default)
3. First Mortgage Amortization Period - User input required
4. First Mortgage CMHC Fee (Percentage of Principal) - User input required (if applicable)
5. First Mortgage Total Principal (Including CMHC Fees) - User input required or calculated
6. First Mortgage Total Monthly Payment - User input required or calculated

### Second Mortgage Fields

7. Second Mortgage Principal Amount - User input required
8. Second Mortgage Interest Rate - User input required
9. Second Mortgage Amortization Period - User input required
10. Second Mortgage Total Monthly Payment - User input required or calculated

### Interest Only Financing Fields (if applicable)

11. Interest Only Principal Amount - User input required
12. Interest Only Interest Rate - User input required
13. Interest Only Total Monthly Payment - User input required or calculated

### Other Fields

14. Other Monthly Financing Costs - User input required
15. Cash Required to Close (After Financing) - User input required or calculated

## Summary

### Available from API (with limitations)

**Current Market Mortgage Rates** (from `mortgageZHLRates`):
- 30-year fixed rate (example: 6.156%)
- 15-year fixed rate (example: 5.49%)
- 5-year ARM rate (example: 6.133%)

**Important Note**: These are market rates from Zillow, not actual loan rates the buyer will receive. These rates can be used to pre-fill the "First Mortgage Interest Rate" field as a default value, but users should be able to override this value.

### User Input Required (all other fields)

**First Mortgage:**
- First Mortgage Principal Borrowed - Loan amount (buyer-specific)
- First Mortgage Interest Rate - Actual loan rate (can default to API market rate)
- First Mortgage Amortization Period - Loan term (15, 20, or 30 years)
- First Mortgage CMHC Fee - Insurance fee percentage (if applicable)
- First Mortgage Total Principal - Including fees (can be calculated)
- First Mortgage Total Monthly Payment - Can be calculated from principal, rate, and period

**Second Mortgage:**
- Second Mortgage Principal Amount - Loan amount (if applicable)
- Second Mortgage Interest Rate - Rate for second mortgage
- Second Mortgage Amortization Period - Loan term for second mortgage
- Second Mortgage Total Monthly Payment - Can be calculated

**Interest Only:**
- Interest Only Principal Amount - If using interest-only financing
- Interest Only Interest Rate - Rate for interest-only loan
- Interest Only Total Monthly Payment - Can be calculated

**Other:**
- Other Monthly Financing Costs - Any additional monthly costs
- Cash Required to Close - Can be calculated from purchase price, down payment, and closing costs

## Recommendations

### 1. Auto-fill Interest Rate from API

Extract `mortgageZHLRates.thirtyYearFixedBucket.rate` from the API response and pre-fill the `firstMtgInterestRate` field with this value as a default. Allow users to override this value if they have a different rate.

### 2. Calculate Monthly Payment

Add a calculation feature for the "First Mortgage Total Monthly Payment" field. When the user enters the principal borrowed, interest rate, and amortization period, automatically calculate the monthly payment using the standard mortgage payment formula.

### 3. Calculate Cash Required to Close

Automatically calculate this value based on:
- Purchase price (available from API: `price`)
- Down payment percentage (user input)
- Closing costs (user input or estimated)

### 4. Add Helper Text

Display current market rates from the API as reference information. Show a message such as "Current 30-year fixed rate: X.XX% (from Zillow)" to help users understand if their rate is competitive.

## Implementation Notes

The Zillow API provides `mortgageZHLRates` in the property detail response, but this data is not currently extracted in the `EnrichedProperty` model. To use this data, the following updates are required:

### 1. Update Backend (ZillowService.java)

In the `parsePropertyDetail` method, add:

```java
// Extract mortgage rates from API response
JsonNode mortgageRates = prop.path("mortgageZHLRates");
if (mortgageRates != null && !mortgageRates.isMissingNode()) {
    JsonNode thirtyYear = mortgageRates.path("thirtyYearFixedBucket");
    property.thirtyYearFixedRate = getDouble(thirtyYear, "rate");
    // Similar extraction for 15-year and ARM rates
}
```

### 2. Update EnrichedProperty Model

Add the following fields to the model:

```java
public Double thirtyYearFixedRate;
public Double fifteenYearFixedRate;
public Double arm5Rate;
```

### 3. Update Frontend (PropertyForm.tsx)

- Pre-fill `firstMtgInterestRate` with `property.thirtyYearFixedRate` if available
- Display market rates as reference information to help users make informed decisions

---

*Last Updated: December 2025*
