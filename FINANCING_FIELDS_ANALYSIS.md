# Financing (Monthly) Section - Field Analysis

## Overview
The "Financing (Monthly)" section contains multiple fields related to mortgage and financing information for the property. Based on the form structure, there are 8 main fields, but the complete section may include additional fields like CMHC fees, Interest Only financing, and other monthly costs.

## Fields in the Financing Section

### 1. **1st Mtg Principle Borrowed ($)**
- **Field Name**: `firstMtgPrincipleBorrowed`
- **User Entered**: ✅ **YES** - Required
- **Available from API**: ❌ **NO**
- **Reason**: This is the loan amount the buyer is borrowing, which is buyer-specific and depends on down payment, purchase price, and lender terms.

### 2. **1st Mtg Interest Rate (%)**
- **Field Name**: `firstMtgInterestRate`
- **User Entered**: ✅ **YES** - Required
- **Available from API**: ⚠️ **PARTIALLY** - Market rates available, but not actual loan rate
- **API Data Available**: 
  - `mortgageZHLRates.thirtyYearFixedBucket.rate` (e.g., 6.156%)
  - `mortgageZHLRates.fifteenYearFixedBucket.rate` (e.g., 5.49%)
  - `mortgageZHLRates.arm5Bucket.rate` (e.g., 6.133%)
- **Note**: These are current market rates from Zillow, not the actual rate the buyer will receive. Actual rates depend on credit score, lender, and loan terms.

### 3. **1st Mtg Amortization Period (Years)**
- **Field Name**: `firstMtgAmortizationPeriod`
- **User Entered**: ✅ **YES** - Required
- **Available from API**: ❌ **NO**
- **Reason**: This is a loan term decision (typically 15, 20, or 30 years) made by the buyer and lender.

### 4. **1st Mtg Total Principle (Incl. CMHC Fees) ($)**
- **Field Name**: `firstMtgTotalPrinciple`
- **User Entered**: ✅ **YES** - Required
- **Available from API**: ❌ **NO**
- **Reason**: This includes loan fees and insurance costs that are lender-specific and buyer-specific.

### 5. **1st Mtg Total Monthly Payment ($)**
- **Field Name**: `firstMtgTotalMonthlyPayment`
- **User Entered**: ✅ **YES** - Required (but can be calculated)
- **Available from API**: ❌ **NO**
- **Note**: This can be **calculated** from:
  - Principal borrowed
  - Interest rate
  - Amortization period
  - Using standard mortgage payment formula: `M = P * [r(1+r)^n] / [(1+r)^n - 1]`

### 6. **2nd Mtg Interest Rate (%)**
- **Field Name**: `secondMtgInterestRate`
- **User Entered**: ✅ **YES** - Required
- **Available from API**: ❌ **NO**
- **Reason**: Second mortgages are less common and have different rates. Not available from Zillow API.

### 7. **2nd Mtg Amortization Period (Years)**
- **Field Name**: `secondMtgAmortizationPeriod`
- **User Entered**: ✅ **YES** - Required
- **Available from API**: ❌ **NO**
- **Reason**: This is a loan term decision for the second mortgage.

### 8. **Cash Required to Close (After Financing) ($)**
- **Field Name**: `cashRequiredToClose`
- **User Entered**: ✅ **YES** - Required (but can be calculated)
- **Available from API**: ❌ **NO**
- **Note**: This can be **calculated** from:
  - Purchase price
  - Down payment percentage
  - Closing costs
  - Loan fees
  - Formula: `Cash Required = Down Payment + Closing Costs + Loan Fees`

## Complete Field List (Based on Form Structure)

### First Mortgage (1st Mtg) Fields:
1. **1st Mtg Principle Borrowed** - User entered
2. **1st Mtg Interest Rate** - User entered (can use API market rate as default)
3. **1st Mtg Amortization Period** - User entered
4. **1st Mtg CMHC Fee (% of Principle)** - User entered (if applicable)
5. **1st Mtg Total Principle (Incl. CMHC Fees)** - User entered or calculated
6. **1st Mtg Total Monthly Payment** - User entered or calculated

### Second Mortgage (2nd Mtg) Fields:
7. **2nd Mtg Principle Amount** - User entered
8. **2nd Mtg Interest Rate** - User entered
9. **2nd Mtg Amortization Period** - User entered
10. **2nd Mtg Total Monthly Payment** - User entered or calculated

### Interest Only Financing Fields (if applicable):
11. **Interest Only Principle Amount** - User entered
12. **Interest Only Interest Rate** - User entered
13. **Interest Only Total Monthly Payment** - User entered or calculated

### Other Fields:
14. **Other Monthly Financing Costs** - User entered
15. **Cash Required to Close (After Financing)** - User entered or calculated

## Summary

### ✅ Can be Fetched from API (with limitations):
1. **Current Market Mortgage Rates** (from `mortgageZHLRates`):
   - 30-year fixed rate (e.g., 6.156%)
   - 15-year fixed rate (e.g., 5.49%)
   - 5-year ARM rate (e.g., 6.133%)
   - ⚠️ **Note**: These are market rates from Zillow, not actual loan rates the buyer will receive
   - **Use Case**: Pre-fill as default for "1st Mtg Interest Rate", user can override

### ❌ Must be User Entered (All Other Fields):
**First Mortgage:**
- 1st Mtg Principle Borrowed - Loan amount (buyer-specific)
- 1st Mtg Interest Rate - Actual loan rate (can default to API market rate)
- 1st Mtg Amortization Period - Loan term (15, 20, 30 years)
- 1st Mtg CMHC Fee - Insurance fee percentage (if applicable)
- 1st Mtg Total Principle - Including fees (can be calculated)
- 1st Mtg Total Monthly Payment - Can be calculated from principal, rate, and period

**Second Mortgage:**
- 2nd Mtg Principle Amount - Loan amount (if applicable)
- 2nd Mtg Interest Rate - Rate for second mortgage
- 2nd Mtg Amortization Period - Loan term for second mortgage
- 2nd Mtg Total Monthly Payment - Can be calculated

**Interest Only:**
- Interest Only Principle Amount - If using interest-only financing
- Interest Only Interest Rate - Rate for interest-only loan
- Interest Only Total Monthly Payment - Can be calculated

**Other:**
- Other Monthly Financing Costs - Any additional monthly costs
- Cash Required to Close - Can be calculated from purchase price, down payment, and closing costs

## Recommendations

### 1. **Auto-fill Interest Rate from API**
   - Extract `mortgageZHLRates.thirtyYearFixedBucket.rate` from API
   - Pre-fill `firstMtgInterestRate` with this value as a default
   - Allow user to override if they have a different rate

### 2. **Calculate Monthly Payment**
   - Add a "Calculate" button next to "1st Mtg Total Monthly Payment"
   - Use mortgage payment formula when user enters:
     - Principal borrowed
     - Interest rate
     - Amortization period

### 3. **Calculate Cash Required to Close**
   - Auto-calculate based on:
     - Purchase price (from API: `price`)
     - Down payment percentage (user input)
     - Closing costs (user input or estimated)

### 4. **Add Helper Text**
   - Show current market rates from API as reference
   - Display: "Current 30-year fixed rate: X.XX% (from Zillow)"
   - Help users understand if their rate is competitive

## Implementation Notes

The Zillow API provides `mortgageZHLRates` in the property detail response, but this data is **NOT currently extracted** in the `EnrichedProperty` model. To use this data:

1. **Update Backend** (`ZillowService.java`):
   ```java
   // In parsePropertyDetail method, add:
   JsonNode mortgageRates = prop.path("mortgageZHLRates");
   if (mortgageRates != null && !mortgageRates.isMissingNode()) {
       JsonNode thirtyYear = mortgageRates.path("thirtyYearFixedBucket");
       property.thirtyYearFixedRate = getDouble(thirtyYear, "rate");
       // Similar for 15-year and ARM rates
   }
   ```

2. **Update EnrichedProperty Model**:
   ```java
   public Double thirtyYearFixedRate;
   public Double fifteenYearFixedRate;
   public Double arm5Rate;
   ```

3. **Update Frontend** (`PropertyForm.tsx`):
   - Pre-fill `firstMtgInterestRate` with `property.thirtyYearFixedRate` if available
   - Show market rates as reference information

