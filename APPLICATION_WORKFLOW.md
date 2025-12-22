Complete Application Workflow - Real-Time Real Estate Investment Analysis - HOUSE HUSTLE

This document provides a comprehensive, step-by-step explanation of how the application works from initial load to property analysis completion. This will help in documenting the codebase effectively.



Table of Contents

1. Application Architecture Overview
2. Initial Application Load
3. User Authentication Flow
4. Dashboard Navigation
5. Property Search Workflow
6. Property Analysis Workflow
7. Cashflow Calculation Flow
8. Report Generation Flow
9. Data Persistence
10.Component Interaction Diagram



Application Architecture Overview

Technology Stack

- Frontend: React 19.2.0 with TypeScript
- Backend: Spring Boot 3.2.0 (Java 17)
- APIs Used:
  - Zillow API (via RapidAPI) - Property data
  - MapBox API - Map display and geocoding
  - Google OAuth - User authentication
- State Management: React Context API
- Storage: Browser localStorage

 Key Components
1. **AuthContext** - Manages user authentication state
2. **PropertiesContext** - Manages saved properties
3. **App.tsx** - Main application router
4. **Dashboard** - Property portfolio view
5. **SearchPage** - Property search interface
6. **PropertyForm** - Property data input and analysis
7. **PropertyReportViewer** - Report display and export
8. **CashflowService** (Backend) - Financial calculations

---

## Initial Application Load

### Step 1: Application Bootstrap
**File**: `src/index.tsx`

1. React application mounts
2. `App.tsx` component renders
3. Application wraps itself with context providers:
   - `AuthProvider` - Handles authentication state
   - `PropertiesProvider` - Handles property data

### Step 2: Context Initialization

**AuthContext Initialization** (`src/context/AuthContext.tsx`):
- Checks `localStorage` for saved user data
- Checks for guest mode flag
- Sets `isLoading` to `false` once initialization complete
- If user found in localStorage, restores session

**PropertiesContext Initialization** (`src/context/PropertiesContext.tsx`):
- Loads saved properties from `localStorage` key: `'savedProperties'`
- Parses JSON data
- Populates `properties` state array
- Sets up auto-save: any changes to properties automatically save to localStorage

### Step 3: Initial View Decision
**File**: `src/App.tsx` (AppContent component)

The application checks authentication state:
- If `isLoading === true`: Shows loading spinner
- If `activeView === 'auth'`: Shows authentication page (default on first load)
- If authenticated/guest: Shows dashboard

**Default State**: Application always starts with `activeView = 'auth'` to ensure users authenticate first.

---

## User Authentication Flow

### Step 1: Auth Page Display
**File**: `src/components/AuthPage.tsx`

When `activeView === 'auth'`, the `AuthPage` component renders:
- Left side: Branding and feature highlights
- Right side: Authentication options

### Step 2: Authentication Options

**Option A: Google OAuth Sign-In**
1. User clicks "Sign in with Google" button
2. Google OAuth popup opens
3. User selects Google account and grants permissions
4. Google returns JWT credential token
5. **Token Processing**:
   - Decodes JWT token (base64 decoding)
   - Extracts user info: name, email, picture, sub (user ID)
   - Creates user object
6. **Backend Verification** (optional):
   - Sends POST request to `http://localhost:8080/api/auth/google`
   - If backend unavailable, continues with local auth only
7. **Local Storage**:
   - Saves user object to `localStorage` key: `'user'`
   - Removes `'isGuest'` flag if present
8. **Context Update**:
   - Calls `login(user)` from AuthContext
   - Sets `isAuthenticated = true`
   - Sets `isGuest = false`
9. **Navigation**: Calls `onAuthSuccess()` callback
   - Sets `activeView = 'dashboard'`
   - Sets `activePage = 'my-properties'`

**Option B: Browse as Guest**
1. User clicks "Browse as Guest" button
2. **Local Storage**:
   - Sets `localStorage.setItem('isGuest', 'true')`
   - Removes any existing user data
3. **Context Update**:
   - Calls `browseAsGuest()` from AuthContext
   - Sets `user = null`
   - Sets `isGuest = true`
   - Sets `isAuthenticated = false`
4. **Navigation**: Same as Google OAuth - navigates to dashboard

### Step 3: Post-Authentication
After successful authentication (either method):
- `App.tsx` receives `onAuthSuccess()` callback
- Updates state: `activeView = 'dashboard'`
- Renders main application layout:
  - Navbar (top navigation)
  - Sidebar (left navigation)
  - MainContent (Dashboard component)

---

## Dashboard Navigation

### Step 1: Dashboard Display
**File**: `src/components/Dashboard.tsx`

The Dashboard shows:
- **Header**: Title, search bar, view mode toggle (List/Map/Both)
- **Strategy Filter**: Dropdown to filter by investment strategy (All/Rental/BRRRR/Flip/Wholesale)
- **Property List**: Grid/list of saved properties
- **Map View**: MapBox map showing property locations (if view mode includes map)

### Step 2: Sidebar Navigation
**File**: `src/components/Sidebar.tsx`

Sidebar has 4 main sections:
1. **Rentals**
   - Properties list
   - Purchase Criteria
2. **BRRRRs**
   - Properties list
   - Purchase Criteria
3. **Flips**
   - Properties list
   - Purchase Criteria
4. **Wholesale**
   - Properties list
   - Purchase Criteria

**User Actions**:
- Click section header → Filters dashboard to show that strategy's properties
- Click "Properties" → Opens property form to add new property of that strategy
- Click "Purchase Criteria" → Opens criteria form for that strategy

### Step 3: Navigation Handlers
**File**: `src/App.tsx`

**handleItemClick()** function:
- If item ID contains `-properties`:
  - Extracts strategy type (rental/brrrr/flip/wholesale)
  - Sets `propertyFormStrategy` state
  - Sets `showPropertyForm = true`
  - Opens PropertyForm component
- If item ID contains `-criteria`:
  - Extracts strategy type
  - Sets `activeView = 'criteria-{strategy}'`
  - Opens PurchaseCriteriaForm component

**handleNavigate()** function:
- Handles top navbar navigation
- `'search-properties'` → Opens SearchPage for property search
- `'my-properties'` → Returns to dashboard
- `'auth'` → Returns to authentication page

---

## Property Search Workflow

### Step 1: Accessing Search
User can access property search via:
- Navbar: Click "Search Properties"
- Dashboard: Click "Add Property" → Select "Search Properties"

**File**: `src/components/SearchPage.tsx`

### Step 2: Search Interface
SearchPage displays:
- Search input field (location/zipcode)
- View mode toggle (List/Map)
- Results area (initially empty)

### Step 3: Property Search Execution

**User Action**: User enters location (e.g., "Boston, MA" or "02115") and clicks search

**Frontend Process** (`SearchPage.tsx` - `handleSearch()`):
1. Validates search query is not empty
2. Sets `isSearching = true`
3. Builds API request:
   - URL: `http://localhost:8080/api/properties/search`
   - Query params: `location={searchText}&status=for_sale&page=1`
   - Method: GET
   - Headers: `Content-Type: application/json`
4. **Backend Request** (tries ports 8080 and 8081):
   - Sends HTTP GET request to backend
   - Backend uses Zillow API via RapidAPI
5. **Backend Processing** (if exists):
   - Receives location parameter
   - Calls Zillow API `propertyExtendedSearch()` method
   - Filters results for "for_sale" status
   - Returns property list with: zpid, address, price, bedrooms, bathrooms, livingArea, coordinates, etc.
6. **Response Handling**:
   - Maps backend response to frontend PropertyResult format
   - Normalizes field names (handles variations: zip/zipCode/postalCode, lat/latitude, etc.)
   - Filters out invalid properties (missing zpid)
   - Updates `searchResults` state
7. **Error Handling**:
   - If backend unavailable: Shows error message
   - If no results: Shows "No properties found" message
   - Sets `isSearching = false`

### Step 4: Search Results Display

**List View**:
- Displays property cards with:
  - Property image
  - Address
  - Price
  - Bedrooms/Bathrooms
  - Living area
  - Property type
- Each card has "Select" button

**Map View**:
- Uses `PropertyMap` component
- Geocodes addresses using MapBox Geocoding API
- Displays markers on map
- Clicking marker shows popup with property details

### Step 5: Property Selection

**User Action**: User clicks "Select" on a property card

**Process**:
1. `onPropertySelect()` callback triggered
2. Passes: `zpid`, `strategy` (default: 'rental'), `searchLocation`
3. **App.tsx** receives callback:
   - Sets `selectedPropertyZpid = zpid`
   - Sets `searchLocation = location`
   - Sets `propertyFormStrategy = strategy`
   - Sets `showPropertyForm = true`
4. **Navigation**: Closes SearchPage, opens PropertyForm

---

## Property Analysis Workflow

### Step 1: Property Form Display
**File**: `src/components/PropertyForm.tsx`

PropertyForm opens with:
- **Input Method Selection** (if no zpid provided):
  - Select from search
  - Import from Zillow
  - Manual entry
- **Form Sections**:
  1. Property Info (address, FMV, vacancy rate, etc.)
  2. Purchase Info (offer price, repairs, closing costs)
  3. Financing (mortgage details)
  4. Income (gross rents)
  5. Operating Expenses (taxes, insurance, repairs, etc.)

### Step 2: Property Data Loading (If zpid Provided)

**Scenario A: Property Selected from Search**
- `selectedZpid` prop is provided
- Form automatically attempts to load property data

**Process** (`PropertyForm.tsx` - useEffect for zpid):
1. Checks if `selectedZpid` exists
2. Sets `isLoadingProperty = true`
3. **Backend Request**:
   - URL: `http://localhost:8080/api/properties/{zpid}`
   - Method: GET
4. **Backend Processing**:
   - Fetches property detail from Zillow API
   - Returns comprehensive property data
5. **Auto-Fill Form**:
   - Maps backend response to form fields
   - Sets `formData` state with property values
   - Marks auto-filled fields in `autoFilledFields` set
   - User can still edit any field
6. **Geocoding** (if coordinates missing):
   - Uses MapBox Geocoding API to get lat/lon
   - Updates `propertyCoordinates` state

**Scenario B: Manual Entry**
- User fills form manually
- No API calls made until analysis

### Step 3: Form Validation

**User Action**: User clicks "Analyze Property" or "Save & Analyze"

**Validation Process**:
1. `validationAttempted = true`
2. Validates required fields:
   - Address, City, State, ZipCode
   - Offer Price
   - Gross Rents
   - First Mortgage details
   - Property Info fields
3. If validation fails:
   - Shows error messages next to invalid fields
   - Prevents form submission
4. If validation passes:
   - Proceeds to cashflow analysis

### Step 4: Cashflow Analysis Trigger

**Process** (`PropertyForm.tsx` - `handleAnalyze()`):
1. Maps form data to `CashflowRequest` format
   - Uses `mapPropertyDataToCashflowRequest()` utility
   - Converts percentages (divides by 100)
   - Handles empty fields (converts to undefined)
2. Calls `analyzeCashflow()` function
3. **API Request** (`src/utils/cashflowApi.ts`):
   - URL: `http://localhost:8080/api/analysis/cashflow`
   - Method: POST
   - Body: JSON stringified CashflowRequest
   - Headers: `Content-Type: application/json`

---

## Cashflow Calculation Flow

### Step 1: Backend Receives Request
**File**: `cashflow-calculator/CashflowController.java`

1. Spring Boot receives POST request at `/api/analysis/cashflow`
2. Deserializes JSON body to `CashflowRequest` DTO
3. Calls `CashflowService.analyze(request)`

### Step 2: Cashflow Calculation
**File**: `cashflow-calculator/CashflowService.java`

**Year 1 Calculations**:

1. **Income Calculation**:
   - Total Income = Gross Rents + Parking + Storage + Laundry + Other Income
   - Vacancy Loss = Total Income × Vacancy Rate
   - Effective Gross Income (EGI) = Total Income - Vacancy Loss

2. **Expense Calculation**:
   - Management Fee = Management Base × Management Rate
   - Repairs = Gross Rents × Repairs Rate
   - Other Operating Expenses = Sum of all expense fields
   - Total Expenses = Management + Repairs + Other Expenses

3. **NOI Calculation**:
   - Net Operating Income (NOI) = EGI - Total Expenses

4. **Debt Service Calculation**:
   - Creates `Amort` objects for first and second mortgages
   - Calculates monthly payment using amortization formula
   - Annual Debt Service = Monthly Payment × 12
   - Handles interest-only periods if specified

5. **Key Metrics**:
   - DSCR (Debt Service Coverage Ratio) = NOI / Annual Debt Service
   - Cap Rate (Purchase Price) = NOI / Offer Price
   - Cap Rate (FMV) = NOI / Fair Market Value
   - Cash-on-Cash Return = (NOI - Annual Debt Service) / Cash to Close
   - Monthly Cash Flow = (NOI - Annual Debt Service) / 12

6. **Multi-Year Projection**:
   - Projects income with growth rate
   - Projects expenses with growth rate
   - Calculates property appreciation
   - Tracks loan paydown (principal reduction)
   - Calculates cash flow for each year
   - Calculates ending loan balances

7. **Exit Analysis**:
   - Calculates property value at exit (with appreciation)
   - Calculates remaining loan balances
   - Applies exit costs (commission, etc.)
   - Net Sale Proceeds = Property Value - Loan Balances - Exit Costs

8. **Advanced Metrics**:
   - IRR (Internal Rate of Return) - uses cash flows and exit proceeds
   - Equity Multiple - Total Return / Initial Investment
   - Various ROI calculations

### Step 3: Response Generation
**File**: `cashflow-calculator/CashflowResponse.java`

Service returns `CashflowResponse` object containing:
- **Summary**: All Year 1 metrics and overall metrics (IRR, Equity Multiple, etc.)
- **Projection**: Array of yearly projections (typically 10 years)

### Step 4: Frontend Receives Response

**Process** (`cashflowApi.ts` - `analyzeCashflow()`):
1. Receives HTTP response
2. Parses JSON to `CashflowResponse` object
3. Returns response to PropertyForm

**Error Handling**:
- If backend not running: Throws `'BACKEND_NOT_RUNNING'` error
- If HTTP error: Throws error with status code
- PropertyForm displays error message to user

### Step 5: Display Results

**PropertyForm** (`handleAnalyze()` continued):
1. Receives `CashflowResponse`
2. Updates form state with results
3. Sets `showReport = true`
4. Renders `PropertyReportViewer` component

---

## Report Generation Flow

### Step 1: Report Viewer Display
**File**: `src/components/PropertyReportViewer.tsx`

When `showReport = true`, PropertyReportViewer:
- Opens as overlay/modal
- Shows loading state initially
- Contains iframe for report display
- Has action buttons: Download, Print, Close

### Step 2: Report HTML Generation
**File**: `src/utils/reportGenerator.ts`

**Process** (`generatePropertyReport()`):
1. Maps form data to CashflowRequest (if not already done)
2. Calls `analyzeCashflow()` to get results (if not cached)
3. Formats data for display:
   - Currency formatting ($1,234,567)
   - Percentage formatting (6.25%)
   - Number formatting with commas
4. Generates HTML report with:
   - **Header**: Report title, date, property address
   - **Property Info**: Basic property details
   - **Key Financial Metrics**: Cash required, EGI, Expenses, NOI, etc.
   - **Year 1 Summary**: Detailed income/expense breakdown
   - **Investment Metrics**: Cap rates, ROI, DSCR, etc.
   - **Multi-Year Projection Table**: Year-by-year cash flows
   - **Footer**: Report metadata
5. Returns HTML string

### Step 3: Report Display

**PropertyReportViewer**:
1. Receives HTML from `generatePropertyReport()`
2. Creates Blob from HTML string
3. Creates Object URL from Blob
4. Sets iframe `src` to Object URL
5. Report renders in iframe

### Step 4: Report Actions

**Download Report**:
1. User clicks Download button
2. Calls `downloadReport()` function
3. Generates HTML report
4. Creates Blob and Object URL
5. Creates temporary `<a>` element
6. Sets `href` to Object URL
7. Sets `download` attribute with filename: `property-report-{address}-{date}.html`
8. Programmatically clicks link
9. Browser downloads HTML file
10. Cleans up: removes link, revokes Object URL

**Print Report**:
1. User clicks Print button
2. Calls `printReport()` function
3. Generates HTML report
4. Opens new window
5. Writes HTML to new window document
6. Calls `window.print()` when loaded
7. Browser print dialog opens

**Close Report**:
1. User clicks Close button
2. Sets `showReport = false` in PropertyForm
3. PropertyReportViewer unmounts
4. Returns to PropertyForm view

---

## Data Persistence

### Property Data Storage

**Saving Property** (`PropertyForm.tsx` - `handleSave()`):
1. Validates form data
2. Creates `SavedProperty` object:
   - Generates unique ID: `prop_{timestamp}_{random}`
   - Sets `createdAt` and `updatedAt` timestamps
   - Includes all form data plus analysis results
3. Calls `addProperty()` from PropertiesContext
4. **PropertiesContext** (`PropertiesContext.tsx`):
   - Adds property to `properties` state array
   - **Auto-save**: useEffect hook detects state change
   - Saves entire array to `localStorage` key: `'savedProperties'`
   - JSON stringifies data before saving

**Updating Property**:
- Similar process but calls `updateProperty(id, updates)`
- Updates existing property in array
- Updates `updatedAt` timestamp
- Auto-saves to localStorage

**Deleting Property**:
- Calls `deleteProperty(id)` from context
- Filters property out of array
- Auto-saves updated array

### User Data Storage

**Authentication State**:
- User object saved to `localStorage` key: `'user'`
- Guest flag saved to `localStorage` key: `'isGuest'`
- Persists across browser sessions
- Loaded on application initialization

### Data Structure

**SavedProperty Interface**:
```typescript
{
  id: string;
  zpid?: string;
  strategy: 'rental' | 'brrrr' | 'flip' | 'wholesale';
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price?: number;
  purchasePrice?: number;
  cashFlow?: number;
  capRate?: number;
  coc?: number;
  // ... other fields
  createdAt: string;
  updatedAt: string;
  isShortlisted?: boolean;
}
```

---

## Component Interaction Diagram

### High-Level Flow

```
App.tsx (Router)
├── AuthPage (if not authenticated)
│   └── AuthContext (manages auth state)
│
└── Main Layout (if authenticated)
    ├── Navbar (top navigation)
    ├── Sidebar (left navigation)
    │   └── PropertiesContext (manages property data)
    │
    └── MainContent
        ├── Dashboard (property list/map view)
        │   ├── PropertyMap (MapBox integration)
        │   └── PropertyComparison
        │
        ├── SearchPage (property search)
        │   ├── PropertySearch (search input)
        │   └── PropertyMap (results on map)
        │       └── Backend API (Zillow via RapidAPI)
        │
        ├── PropertyForm (property input/analysis)
        │   ├── PropertySearch (if importing)
        │   ├── Cashflow API call
        │   │   └── Backend: CashflowController
        │   │       └── CashflowService (calculations)
        │   └── PropertyReportViewer
        │       └── reportGenerator (HTML generation)
        │
        └── PurchaseCriteriaForm (investment criteria)
```

### Data Flow: Property Analysis

```
User Input (PropertyForm)
    ↓
Form Validation
    ↓
mapPropertyDataToCashflowRequest()
    ↓
analyzeCashflow() [HTTP POST]
    ↓
Backend: CashflowController
    ↓
CashflowService.analyze()
    ↓
Financial Calculations
    ↓
CashflowResponse
    ↓
Frontend receives response
    ↓
generatePropertyReport()
    ↓
PropertyReportViewer displays
    ↓
User can Download/Print
```

### State Management Flow

```
PropertiesContext
    ↓
properties state array
    ↓
useEffect (auto-save)
    ↓
localStorage.setItem('savedProperties', JSON.stringify(properties))
    ↓
Persists across sessions
    ↓
On app load: Loads from localStorage
```

---

## Key Integration Points

### 1. Zillow API Integration
- **Backend**: Uses RapidAPI to access Zillow API
- **Endpoints Used**:
  - `propertyExtendedSearch` - Search for properties
  - `propertyDetail` - Get detailed property info
  - `rentEstimate` - Get rental estimates
- **Configuration**: API key stored in `application.yml` or environment variable

### 2. MapBox Integration
- **Frontend**: Direct integration via `mapbox-gl` library
- **Features Used**:
  - Map display
  - Geocoding API (address to coordinates)
  - Markers and popups
  - Search box
- **Configuration**: Access token from `REACT_APP_MAPBOX_ACCESS_TOKEN` environment variable

### 3. Google OAuth Integration
- **Frontend**: Uses `@react-oauth/google` library
- **Flow**: JWT token decoding, user info extraction
- **Configuration**: Client ID from `REACT_APP_GOOGLE_CLIENT_ID` environment variable

### 4. Backend-Frontend Communication
- **Protocol**: HTTP REST API
- **Backend Port**: 8080 (configurable in `application.yml`)
- **CORS**: Backend must allow frontend origin (localhost:3000)
- **Endpoints**:
  - `GET /api/properties/search` - Property search
  - `GET /api/properties/{zpid}` - Property details
  - `POST /api/analysis/cashflow` - Cashflow analysis
  - `POST /api/auth/google` - Google auth verification (optional)

---

## Error Handling Patterns

### Frontend Error Handling
1. **API Errors**: Try-catch blocks around fetch calls
2. **Backend Unavailable**: Detects connection errors, shows user-friendly message
3. **Validation Errors**: Form-level validation with field-specific error messages
4. **Loading States**: Shows spinners during async operations

### Backend Error Handling
1. **API Errors**: HTTP status codes (400, 500, etc.)
2. **Calculation Errors**: Returns error response with message
3. **Missing Data**: Handles null/undefined values gracefully

---

## Performance Considerations

1. **localStorage**: Used for persistence, but limited to ~5-10MB
2. **API Calls**: Debounced search inputs to reduce API calls
3. **Map Rendering**: Only renders map when view mode includes map
4. **Report Generation**: Cached results to avoid recalculation
5. **Context Updates**: Batched updates to reduce re-renders

---

## Security Considerations

1. **API Keys**: Stored in environment variables, not in code
2. **OAuth Tokens**: JWT tokens decoded client-side (for demo purposes)
3. **CORS**: Backend should restrict allowed origins in production
4. **Input Validation**: Both frontend and backend validate inputs
5. **XSS Prevention**: React automatically escapes user input

---

This workflow document should help you understand the complete application flow and document the codebase effectively. Each component and function can be documented with reference to its role in this overall workflow.
