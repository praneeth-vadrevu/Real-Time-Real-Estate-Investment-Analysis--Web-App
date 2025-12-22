# Real-Time Real Estate Investment Analysis - Code Documentation

Welcome to the comprehensive code documentation for the Real-Time Real Estate Investment Analysis web application. This documentation provides detailed information about the codebase, architecture, components, and APIs.

---

## Project Overview

The Real-Time Real Estate Investment Analysis application is a full-stack web platform designed to help real estate investors analyze investment opportunities efficiently. The application enables users to search for properties, perform detailed financial analysis, compare multiple deals, and generate comprehensive investment reports.

### Key Capabilities

- **Property Search**: Search and discover properties across the United States using live Zillow data
- **Investment Analysis**: Calculate comprehensive financial metrics including cashflow, cap rates, IRR, and equity multiples
- **Multi-Strategy Support**: Analyze properties using four different investment strategies (Rental, BRRRR, Flip, Wholesale)
- **Property Comparison**: Side-by-side comparison of multiple properties with detailed metrics
- **Interactive Maps**: Visualize properties on interactive MapBox maps with geocoding support
- **Report Generation**: Generate detailed HTML investment analysis reports
- **User Management**: Google OAuth authentication with guest mode support

---

## System Architecture

### Application Structure

The application follows a client-server architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                          │
│  Port: 3000                                                  │
│  - User Interface Components                                 │
│  - State Management (Context API)                           │
│  - MapBox Integration                                       │
│  - Google OAuth                                              │
└──────────────────────┬──────────────────────────────────────┘
                       │ REST API (JSON)
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                  Backend (Spring Boot)                      │
│  Port: 8080                                                  │
│  - REST Controllers                                          │
│  - Business Logic Services                                   │
│  - Data Models and DTOs                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              External APIs                                  │
│  - Zillow API (via RapidAPI)                                │
│  - Google API 31 (via RapidAPI)                             │
│  - MapBox API (direct from frontend)                        │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend Technologies:**
- React 19.2.0 - UI library for building user interfaces
- TypeScript 4.9.5 - Type-safe JavaScript development
- Create React App 5.0.1 - Build tooling and development environment
- MapBox GL JS 3.16.0 - Interactive map visualization
- react-map-gl 8.1.0 - React wrapper for MapBox
- @react-oauth/google 0.12.2 - Google OAuth integration
- react-icons 5.5.0 - Icon library

**Backend Technologies:**
- Spring Boot 3.2.0 - Java application framework
- Java 17 - Programming language
- Maven 3.8+ - Build and dependency management
- Jackson 2.15.x - JSON processing
- Java HttpClient - HTTP client for API calls

**External Services:**
- Zillow API (via RapidAPI) - Property data and search
- Google API 31 (via RapidAPI) - Geocoding and place search
- MapBox API - Map display and geocoding (frontend)
- Google OAuth - User authentication

---

## Backend Architecture

### Package Structure

The backend is organized into three main packages:

#### 1. com.example.map
**Location**: `googlemapv2/src/main/java/com/example/map/`

Core application components and geocoding services:
- **Application.java**: Main Spring Boot application entry point
- **config/CorsConfig.java**: CORS configuration for frontend access
- **geo/GeoController.java**: REST endpoints for geocoding services
- **geo/GoogleApi31Service.java**: Service for Google API 31 integration

#### 2. com.example.realestate
**Location**: `googlemapv2/src/main/java/com/example/realestate/`

Property search and data management:
- **controller/PropertyController.java**: REST endpoints for property search and details
- **model/EnrichedProperty.java**: Comprehensive property data model
- **model/SearchCard.java**: Property search result model
- **service/ZillowService.java**: Zillow API integration and data enrichment

#### 3. com.example.analysis
**Location**: `googlemapv2/src/main/java/com/example/analysis/`

Investment analysis and financial calculations:
- **controller/CashflowController.java**: REST endpoints for cashflow analysis
- **dto/CashflowRequest.java**: Input DTO for analysis requests
- **dto/CashflowResponse.java**: Output DTO with analysis results
- **service/CashflowService.java**: Core financial calculation engine

#### 4. cashflow-calculator
**Location**: `cashflow-calculator/`

Standalone cashflow calculator module:
- **CashflowService.java**: Financial calculation service
- **CashflowController.java**: REST controller
- **CashflowRequest.java**: Request DTO
- **CashflowResponse.java**: Response DTO

### Backend API Endpoints

**Property Endpoints:**
- `GET /api/properties/search` - Search properties by location
- `GET /api/properties/{zpid}` - Get detailed property information

**Analysis Endpoints:**
- `POST /api/analysis/cashflow` - Perform cashflow analysis

**Geocoding Endpoints:**
- `GET /api/geo/text` - Text-based place search
- `GET /api/geo/circle` - Radius-based location search

### Key Backend Components

**CashflowService**: Core financial calculation engine that performs:
- Net Operating Income (NOI) calculations
- Debt service calculations with amortization
- Cap rate analysis (Purchase Price and Fair Market Value)
- Cash-on-Cash return calculations
- Internal Rate of Return (IRR) using Newton-Raphson method
- Multi-year cashflow projections
- Equity multiple calculations

**ZillowService**: Handles all Zillow API interactions:
- Property search by location
- Property detail retrieval
- Data enrichment from multiple API endpoints
- Response parsing and normalization

**GoogleApi31Service**: Provides geocoding capabilities:
- Address to coordinates conversion
- Place search functionality
- Location-based queries

---

## Frontend Architecture

### Component Structure

The frontend is organized into logical component groups:

#### Page Components
**Location**: `real-time-real-estate-analyzer/real-time-analyzer/src/components/`

- **AuthPage.tsx**: Authentication page with Google OAuth and guest mode
- **Dashboard.tsx**: Main property portfolio dashboard with list and map views
- **SearchPage.tsx**: Property search interface with backend integration
- **PropertyForm.tsx**: Comprehensive property data input and analysis form
- **PropertyReportViewer.tsx**: Investment report display and export
- **PropertyComparison.tsx**: Side-by-side property comparison tool

#### Layout Components
- **Navbar.tsx**: Top navigation bar with user menu and navigation links
- **Sidebar.tsx**: Left sidebar navigation organized by investment strategy
- **Footer.tsx**: Application footer with developer credits
- **MainContent.tsx**: Main content area for property management

#### Feature Components
- **PropertyMap.tsx**: Interactive MapBox map with property markers
- **PropertySearch.tsx**: Property search component with autocomplete
- **PropertyPopup.tsx**: Property detail popup modal
- **PurchaseCriteriaForm.tsx**: Investment criteria configuration form

#### Context Providers
**Location**: `real-time-real-estate-analyzer/real-time-analyzer/src/context/`

- **AuthContext.tsx**: Manages user authentication state and Google OAuth
- **PropertiesContext.tsx**: Manages saved properties collection and CRUD operations

#### Utility Functions
**Location**: `real-time-real-estate-analyzer/real-time-analyzer/src/utils/`

- **cashflowApi.ts**: Backend API integration for cashflow analysis
- **reportGenerator.ts**: HTML report generation and export functionality

### Frontend State Management

The application uses React Context API for global state:

**AuthContext** provides:
- User authentication state
- Login/logout functionality
- Guest mode support
- Session persistence via localStorage

**PropertiesContext** provides:
- Saved properties collection
- Add, update, delete operations
- Property shortlisting
- Strategy-based filtering
- LocalStorage persistence

### Frontend API Integration

The frontend communicates with the backend via REST API:

**Base URL**: `http://localhost:8080`

**Key API Calls:**
- Property search: `GET /api/properties/search?location={location}&status={status}`
- Property details: `GET /api/properties/{zpid}`
- Cashflow analysis: `POST /api/analysis/cashflow`

**External API Integrations:**
- MapBox API: Direct integration for map display and geocoding
- Google OAuth: Direct integration for user authentication

---

## Investment Strategies

The application supports four distinct investment strategies, each with specific analysis parameters:

### 1. Rental Strategy
Long-term buy-and-hold properties for consistent cashflow:
- Focus on monthly cashflow and cap rates
- Long-term holding period analysis
- Rental income optimization
- Property appreciation tracking

### 2. BRRRR Strategy
Buy, Rehab, Rent, Refinance, Repeat method:
- Initial purchase and rehab costs
- Refinancing calculations
- Repeat investment analysis
- Equity extraction metrics

### 3. Flip Strategy
Buy, renovate, and sell for profit:
- Purchase and rehab costs
- After Repair Value (ARV) analysis
- Profit margin calculations
- Time-to-sale considerations

### 4. Wholesale Strategy
Assign contracts to other investors:
- Assignment fee calculations
- Quick turnaround analysis
- Contract terms evaluation

---

## Financial Calculations

The application performs comprehensive financial analysis:

### Year 1 Metrics
- **Net Operating Income (NOI)**: Effective Gross Income minus Total Expenses
- **Cap Rate**: NOI divided by Purchase Price or Fair Market Value
- **Debt Service Coverage Ratio (DSCR)**: NOI divided by Annual Debt Service
- **Cash-on-Cash Return**: Annual Cash Flow divided by Cash Required to Close
- **Gross Rent Multiplier (GRM)**: Purchase Price divided by Annual Gross Rents

### Multi-Year Projections
- Annual income and expense growth
- Loan balance tracking
- Property appreciation
- Cashflow projections
- Equity accumulation

### Exit Metrics
- **Internal Rate of Return (IRR)**: Calculated using Newton-Raphson method
- **Equity Multiple**: Total distributions divided by initial investment
- **Net Sale Proceeds**: Sale price minus costs and remaining loan balance

---

## Documentation Navigation

### Using This Documentation

**Main Navigation Menu:**
- **Main Page**: This overview page
- **Classes**: Browse all documented classes and interfaces
- **Files**: Browse all source files organized by directory
- **Namespaces**: Java package organization (backend only)
- **Search**: Search for specific classes, methods, or files

### Finding Specific Information

**Backend Classes:**
- Navigate to **Classes** → Filter by namespace (e.g., `com.example.analysis`)
- Or use **Search** to find specific class names

**Frontend Components:**
- Navigate to **Files** → Expand `real-time-real-estate-analyzer/real-time-analyzer/src/components/`
- Or use **Search** to find component names

**API Endpoints:**
- Check controller classes in `com.example.*.controller` packages
- Look for methods annotated with `@GetMapping` or `@PostMapping`

**Financial Calculations:**
- Review `CashflowService` class documentation
- Check method documentation for calculation formulas

---

## Code Organization

### Backend Code Structure

```
googlemapv2/src/main/java/com/example/
├── map/                    # Application core
│   ├── Application.java
│   ├── config/
│   │   └── CorsConfig.java
│   └── geo/
│       ├── GeoController.java
│       └── GoogleApi31Service.java
├── realestate/             # Property domain
│   ├── controller/
│   │   └── PropertyController.java
│   ├── model/
│   │   ├── EnrichedProperty.java
│   │   └── SearchCard.java
│   └── service/
│       └── ZillowService.java
└── analysis/               # Investment analysis
    ├── controller/
    │   └── CashflowController.java
    ├── dto/
    │   ├── CashflowRequest.java
    │   └── CashflowResponse.java
    └── service/
        └── CashflowService.java
```

### Frontend Code Structure

```
real-time-real-estate-analyzer/real-time-analyzer/src/
├── components/             # React components
│   ├── AuthPage.tsx
│   ├── Dashboard.tsx
│   ├── SearchPage.tsx
│   ├── PropertyForm.tsx
│   ├── PropertyMap.tsx
│   ├── PropertyReportViewer.tsx
│   ├── PropertyComparison.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   └── ...
├── context/                # State management
│   ├── AuthContext.tsx
│   └── PropertiesContext.tsx
├── utils/                  # Utility functions
│   ├── cashflowApi.ts
│   └── reportGenerator.ts
├── App.tsx                 # Main application
└── index.tsx               # Entry point
```

---

## Key Classes and Components

### Backend Key Classes

**CashflowService**
- Core financial calculation engine
- Implements investment analysis algorithms
- Calculates NOI, cap rates, IRR, and multi-year projections
- Location: `com.example.analysis.service.CashflowService`

**ZillowService**
- Zillow API integration service
- Handles property search and data enrichment
- Aggregates data from multiple API endpoints
- Location: `com.example.realestate.service.ZillowService`

**PropertyController**
- REST API endpoints for property operations
- Handles search and detail retrieval requests
- Location: `com.example.realestate.controller.PropertyController`

**CashflowController**
- REST API endpoints for investment analysis
- Accepts analysis requests and returns calculated metrics
- Location: `com.example.analysis.controller.CashflowController`

### Frontend Key Components

**App.tsx**
- Main application component
- Handles routing and page navigation
- Wraps application with context providers
- Location: `src/App.tsx`

**Dashboard.tsx**
- Main property portfolio view
- Displays saved properties in list and map formats
- Provides filtering and search capabilities
- Location: `src/components/Dashboard.tsx`

**PropertyForm.tsx**
- Comprehensive property data input form
- Supports multiple investment strategies
- Triggers cashflow analysis
- Generates investment reports
- Location: `src/components/PropertyForm.tsx`

**PropertyMap.tsx**
- Interactive MapBox map component
- Displays property markers
- Handles geocoding for addresses
- Location: `src/components/PropertyMap.tsx`

**AuthContext.tsx**
- Authentication state management
- Google OAuth integration
- Guest mode support
- Location: `src/context/AuthContext.tsx`

**PropertiesContext.tsx**
- Saved properties state management
- CRUD operations for properties
- LocalStorage persistence
- Location: `src/context/PropertiesContext.tsx`

---

## Data Models

### Backend Data Models

**EnrichedProperty**
- Comprehensive property data structure
- Aggregates data from multiple Zillow API endpoints
- Includes property details, estimates, images, and comparables
- Location: `com.example.realestate.model.EnrichedProperty`

**SearchCard**
- Lightweight property search result model
- Used for property search listings
- Location: `com.example.realestate.model.SearchCard`

**CashflowRequest**
- Input DTO for cashflow analysis
- Contains all property and financial parameters
- Location: `com.example.analysis.dto.CashflowRequest`

**CashflowResponse**
- Output DTO with analysis results
- Includes summary metrics and yearly projections
- Location: `com.example.analysis.dto.CashflowResponse`

### Frontend Data Models

**PropertyData**
- Frontend property data structure
- Used in property forms and analysis
- Maps to backend CashflowRequest
- Location: `src/components/PropertyForm.tsx`

**SavedProperty**
- Saved property structure in context
- Includes analysis results and metadata
- Location: `src/context/PropertiesContext.tsx`

---

## API Documentation

### Backend REST API

All backend APIs are documented in the controller classes. Key endpoints include:

**Property Search API**
- Endpoint: `GET /api/properties/search`
- Parameters: `location`, `status`, `page`
- Returns: List of `SearchCard` objects
- Controller: `PropertyController.searchProperties()`

**Property Details API**
- Endpoint: `GET /api/properties/{zpid}`
- Parameters: `zpid` (Zillow Property ID)
- Returns: `EnrichedProperty` object
- Controller: `PropertyController.getPropertyDetails()`

**Cashflow Analysis API**
- Endpoint: `POST /api/analysis/cashflow`
- Body: `CashflowRequest` JSON object
- Returns: `CashflowResponse` with calculated metrics
- Controller: `CashflowController.analyze()`

### Frontend API Integration

Frontend API calls are handled in utility functions:

**cashflowApi.ts**
- `mapPropertyDataToCashflowRequest()`: Converts form data to API format
- `analyzeCashflow()`: Sends analysis request to backend
- Location: `src/utils/cashflowApi.ts`

---

## Development Workflow

### Generating Documentation

To regenerate this documentation after code changes:

```bash
# Navigate to project root
cd "/Users/vsss/MSCS 3rdSem/CS 682/Real-Time-Real-Estate-Investment-Analysis--Web-App"

# Generate documentation
doxygen Doxyfile

# View documentation
open docs/html/index.html
```

### Adding Documentation Comments

**Java (Backend):**
Use JavaDoc comments:
```java
/**
 * Calculates cashflow analysis for a property investment.
 * 
 * @param request Input parameters for analysis
 * @return Complete analysis with summary and projections
 */
public CashflowResponse analyze(CashflowRequest request) {
    // Implementation
}
```

**TypeScript (Frontend):**
Use JSDoc comments:
```typescript
/**
 * Handles property selection from search results.
 * Fetches property details and auto-fills form.
 * 
 * @param zpid Zillow Property ID
 */
const handlePropertySelect = async (zpid: string) => {
    // Implementation
};
```

---

## Related Documentation

For additional information, refer to these documentation files:

- **USER_GUIDE.md**: Complete user guide with setup and usage instructions
- **BACKEND_DEVELOPER_GUIDE.md**: Detailed backend development guide
- **FRONTEND_DEVELOPER_GUIDE.md**: Detailed frontend development guide
- **BACKEND_USER_GUIDE.md**: Backend-specific user guide
- **FRONTEND_USER_GUIDE.md**: Frontend-specific user guide
- **APPLICATION_WORKFLOW.md**: Complete application workflow documentation
- **FINANCING_FIELDS_ANALYSIS.md**: Analysis of financing field requirements

---

## Project Information

**Project Name**: Real-Time Real Estate Investment Analysis  
**Version**: 1.0.0  
**Last Updated**: December 2025  
**Documentation Generated**: Doxygen 1.15.0

---

*This documentation is automatically generated from source code comments. For the most up-to-date information, refer to the source code files directly.*
