# Developer Guide

## Contents

- [Architecture](#architecture-overview)
- [Frontend](#frontend-development)
- [Backend](#backend-development)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Business Logic](#business-logic)
- [Testing](#testing)
- [Deployment](#deployment)
- [Code Style](#code-style-guide)

---

## Architecture Overview

### How It Fits Together

**Browser (React App)**
- Components: UI elements
- Context Providers: Global state (Auth, Properties)
- Utils: API calls, helpers

**Spring Boot Backend**
- Controllers: Handle HTTP requests
- Services: Business logic
- Models: DTOs

**External APIs**
- Zillow API, Google API 31, Mapbox API

### Component Responsibilities

**Frontend:**
- Components - UI rendering and user interaction
- Context - Global state management
- Utils - API calls and helper functions

**Backend:**
- Controllers - HTTP request handling
- Services - Business logic implementation
- Models - Data structures and DTOs

---

## Frontend Development

### Project Structure

Frontend files are in `real-time-real-estate-analyzer/real-time-analyzer/src/`:

**Main files:** App.tsx, App.css, index.tsx

**components/**: AuthPage.tsx, Dashboard.tsx, SearchPage.tsx, PropertyMap.tsx, PropertyForm.tsx, PropertyComparison.tsx, PropertyReportViewer.tsx, PurchaseCriteriaForm.tsx, Navbar.tsx, Sidebar.tsx, MainContent.tsx, Footer.tsx, PropertyPopup.tsx

**context/**: AuthContext.tsx, PropertiesContext.tsx

**utils/**: cashflowApi.ts, reportGenerator.ts
### Key Components

#### App.tsx
Main application component that handles routing and page state.

```tsx
// Key state management
const [activePage, setActivePage] = useState("my-properties");
const [activeView, setActiveView] = useState<string | null>('auth');
const [showPropertyForm, setShowPropertyForm] = useState(false);

// Navigation handler
const handleNavigate = (page: string) => {
  setActivePage(page);
  if (page === 'home' || page === 'my-properties') {
    setActiveView('dashboard');
  } else if (page === 'search-properties') {
    setActiveView('search-properties');
  }
  // ...
};
```

#### AuthContext.tsx
Manages user authentication state using Google OAuth.

```tsx
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (credential: string) => void;
  loginAsGuest: () => void;
  logout: () => void;
}
```

#### PropertiesContext.tsx
Manages the global properties state across all components.

```tsx
interface PropertiesContextType {
  properties: Property[];
  addProperty: (property: Property) => void;
  removeProperty: (id: string) => void;
  updateProperty: (id: string, data: Partial<Property>) => void;
  getPropertyByZpid: (zpid: string) => Property | undefined;
}
```

#### cashflowApi.ts
API client for backend communication. This module handles the cashflow analysis API calls.

```tsx
// Cashflow analysis endpoint
const CASHFLOW_API_URL = 'http://localhost:8080/api/analysis/cashflow';

// Main analysis function
export async function analyzeCashflow(request: CashflowRequest): Promise<CashflowResponse> {
  const response = await fetch(CASHFLOW_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to analyze cashflow: ${response.status}`);
  }
  
  return response.json();
}

// Helper to convert PropertyForm data to API request format
export function mapPropertyDataToCashflowRequest(formData: PropertyData): CashflowRequest {
  return {
    offerPrice: formData.offerPrice,
    grossRentsAnnual: formData.grossRents,
    vacancyRate: formData.vacancyRate / 100,
    managementRate: formData.managementRate / 100,
    // ... other field mappings
  };
}
```

**Note:** Property search (`/api/properties/search`) and property details (`/api/properties/{zpid}`) API calls are made directly in components (`SearchPage.tsx`, `PropertySearch.tsx`, `PropertyForm.tsx`) rather than through this utility module.

### Environment Variables

Create a `.env` file in the frontend root:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_MAPBOX_TOKEN=pk.your-mapbox-token
REACT_APP_API_URL=http://localhost:8080
```

### Adding New Components

1. Create component file in `src/components/`
2. Define TypeScript interfaces for props
3. Implement component with proper typing
4. Export and import where needed

Example:
```tsx
// src/components/NewComponent.tsx
import React from 'react';

interface NewComponentProps {
  title: string;
  data: SomeDataType;
  onAction: (id: string) => void;
}

const NewComponent: React.FC<NewComponentProps> = ({ title, data, onAction }) => {
  return (
    <div className="new-component">
      <h2>{title}</h2>
      {/* Component content */}
    </div>
  );
};

export default NewComponent;
```

---

## Backend Development

### Project Structure

```
googlemapv2/
├── src/
│   ├── main/
│   │   ├── java/com/example/googlemapv2/
│   │   │   ├── GoogleApi31Service.java      # Main service class
│   │   │   ├── CashflowController.java      # REST controller
│   │   │   ├── CashflowService.java         # Business logic
│   │   │   ├── CashflowRequest.java         # Request DTO
│   │   │   └── CashflowResponse.java        # Response DTO
│   │   │
│   │   └── resources/
│   │       └── application.yml              # Configuration
│   │
│   └── test/
│       └── java/com/example/googlemapv2/
│           └── CashflowServiceTest.java
│
├── pom.xml
├── README.md
├── USER_GUIDE.md
└── DEVELOPER_GUIDE.md
```

### Key Classes

#### GoogleApi31Service.java
Service class for Google API 31 integration (not currently used by frontend).

```java
@Service
public class GoogleApi31Service {
    // Text-based search
    public JsonNode byText(String text, String place, String city, 
                           String state, String country, String postcode);
    
    // Circular range search
    public JsonNode byCircle(double latitude, double longitude, 
                             String text, int radiusMeters);
    
    // Raw query passthrough
    public JsonNode query(Map<String, Object> params);
}
```

#### GeoController.java
REST controller exposing Google Geo API endpoints (not currently used by frontend).

```java
@RestController
@RequestMapping("/api/geo")
public class GeoController {
    @GetMapping("/text")   // Text-based place search
    @GetMapping("/circle") // Radius-based search
    @PostMapping("/raw")   // Raw API passthrough
}
```

#### CashflowController.java (Used by Frontend)
Handles investment cashflow analysis.

```java
@RestController
@RequestMapping("/api/analysis")
public class CashflowController {

    private final CashflowService svc = new CashflowService();

    @PostMapping("/cashflow")
    public CashflowResponse analyze(@RequestBody CashflowRequest req) {
        return svc.analyze(req);
    }
}
```

#### PropertyController.java (Used by Frontend)
Handles property search and details (implemented in `com.example.realestate.controller`).

```java
@RestController
@RequestMapping("/api/properties")
public class PropertyController {
    @GetMapping("/search")    // Search properties by location
    @GetMapping("/{zpid}")    // Get property details by ZPID
}
```

**Note:** PropertyController source code is compiled but not included in this repository. It interfaces with the Zillow API via RapidAPI.

#### CashflowService.java
Business logic for investment calculations.

```java
@Service
public class CashflowService {

    public CashflowResponse calculate(CashflowRequest request) {
        // Calculate mortgage payment
        double monthlyPayment = calculateMortgage(
            request.getPurchasePrice(),
            request.getDownPaymentPercent(),
            request.getInterestRate(),
            request.getLoanTermYears()
        );

        // Calculate expenses
        double monthlyExpenses = calculateExpenses(request);

        // Calculate cashflow
        double monthlyCashflow = request.getMonthlyRent() - monthlyPayment - monthlyExpenses;

        // Calculate ROI metrics
        double cashOnCash = calculateCashOnCash(monthlyCashflow, request);
        double capRate = calculateCapRate(request);
        double irr = calculateIRR(request);

        return new CashflowResponse(/* ... */);
    }
}
```

### Configuration

**application.yml:**
```yaml
server:
  port: 8080

spring:
  application:
    name: real-estate-backend

rapidapi:
  key: ${RAPIDAPI_KEY:your-default-key}
  zillow:
    host: zillow-com1.p.rapidapi.com
  google:
    host: google-api31.p.rapidapi.com

logging:
  level:
    com.example.googlemapv2: DEBUG
```

### Adding New Endpoints

1. Create controller class or add to existing
2. Define service class for business logic
3. Create request/response DTOs
4. Add appropriate annotations

Example:
```java
// New endpoint in controller
@GetMapping("/new-feature")
public ResponseEntity<NewFeatureResponse> newFeature(
        @RequestParam String param) {
    NewFeatureResponse response = newFeatureService.process(param);
    return ResponseEntity.ok(response);
}
```

---

## API Reference

### Backend Implementation Overview

The backend provides three categories of APIs:

1. **Zillow API (via RapidAPI)** - Property search and details
2. **Cashflow Analysis** - Investment calculations (built-in)
3. **Google API 31 (via RapidAPI)** - Geocoding and place search

### APIs Connected to Frontend

These are called by the React app:

#### Property Search (Zillow)
```http
GET /api/properties/search
```

**Parameters:**
- `location` (string, required) - City, state, or ZIP code
- `status` (string, optional) - Listing status: for_sale, for_rent, sold
- `page` (integer, optional) - Page number, default 1

**Frontend Usage:** `SearchPage.tsx`, `PropertySearch.tsx`

**Response:**
```json
[
  {
    "propertyId": "20479916",
    "address": "123 Main St, Santa Monica, CA 90401",
    "streetAddress": "123 Main St",
    "city": "Santa Monica",
    "state": "CA",
    "zip": "90401",
    "county": "Los Angeles",
    "countyFIPS": "06037",
    "listPrice": 350000,
    "bedrooms": 3,
    "bathrooms": 2,
    "livingArea": 1500
  }
]
```

#### Property Details (Zillow)
```http
GET /api/properties/{zpid}
```

**Called from:** `PropertyForm.tsx`

**Response:** Full property details including coordinates, images, tax info, etc.

#### Cashflow Analysis
```http
POST /api/analysis/cashflow
Content-Type: application/json
```

**Frontend Usage:** `cashflowApi.ts` → `analyzeCashflow()`

**Request Body:**
```json
{
  "address": "123 Main St",
  "city": "Santa Monica",
  "state": "CA",
  "zip": "90401",
  "fmv": 350000,
  "offerPrice": 300000,
  "annualAppreciation": 0.03,
  "grossRentsAnnual": 36000,
  "numberOfUnits": 1,
  "vacancyRate": 0.05,
  "managementRate": 0.08,
  "repairsRate": 0.05,
  "propertyTaxes": 3600,
  "insurance": 1500,
  "firstPrincipal": 240000,
  "firstRateAnnual": 0.07,
  "firstAmortYears": 30,
  "holdYears": 10,
  "rentGrowth": 0.03,
  "expenseGrowth": 0.03,
  "exitCostRate": 0.06
}
```

**Response:**
```json
{
  "summary": {
    "cashToClose": 60000,
    "noiY1": 24000,
    "cashOnCashY1": 8.57,
    "capRateFMVY1": 6.86,
    "dscrY1": 1.25,
    "irr": 12.3,
    "equityMultiple": 2.1
  },
  "projection": [
    {
      "year": 1,
      "totalIncome": 36000,
      "vacancyLoss": 1800,
      "egi": 34200,
      "totalExpenses": 10200,
      "noi": 24000,
      "debtService": 19160,
      "cashFlowBeforeTax": 4840
    }
  ]
}
```

---

### Backend APIs Not Connected to Frontend

These endpoints are implemented but the frontend uses Mapbox directly for maps/geocoding instead.

#### Google API 31 - Text Search
```http
GET /api/geo/text
```

**Parameters (all optional):**
- `text` - Search keyword
- `place` - Place name
- `city` - City name
- `state` - State code
- `country` - Country name
- `postcode` - ZIP/postal code

**Example:**
```bash
curl "http://localhost:8080/api/geo/text?text=restaurant&city=Santa%20Monica&state=CA"
```

#### Circle Radius Search
```http
GET /api/geo/circle
```

**Parameters:**
- `lat` (double, required) - Latitude of center
- `lon` (double, required) - Longitude of center
- `radius` (int, optional) - Radius in meters, default 1000
- `text` (string, optional) - Search keyword

**Example:**
```bash
curl "http://localhost:8080/api/geo/circle?lat=34.0195&lon=-118.4912&radius=5000&text=coffee"
```

#### Raw Query Passthrough
```http
POST /api/geo/raw
Content-Type: application/json
```

**Request Body:** Any valid Google API 31 query parameters.

**Note:** These endpoints can be used for future features like nearby amenities search, walkability scoring, or location intelligence.

---

## Data Models

### Frontend (TypeScript)

```typescript
// Property model
interface Property {
  zpid: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  livingArea: number;
  lotSize?: number;
  yearBuilt?: number;
  propertyType: string;
  latitude: number;
  longitude: number;
  zestimate?: number;
  rentZestimate?: number;
  images?: string[];
  investmentStrategy: 'rental' | 'brrrr' | 'flip' | 'wholesale';
}

// Cashflow request
interface CashflowRequest {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  monthlyRent: number;
  propertyTaxRate: number;
  insuranceAnnual: number;
  maintenancePercent: number;
  vacancyPercent: number;
  managementPercent: number;
  closingCostPercent?: number;
  rehabCost?: number;
}

// Cashflow response
interface CashflowResponse {
  monthlyMortgage: number;
  monthlyExpenses: number;
  monthlyCashflow: number;
  annualCashflow: number;
  cashOnCashReturn: number;
  capRate: number;
  irr: number;
  totalCashNeeded: number;
}

// User model
interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
}
```

### Backend Models (Java)

```java
// CashflowRequest.java
public class CashflowRequest {
    private double purchasePrice;
    private double downPaymentPercent;
    private double interestRate;
    private int loanTermYears;
    private double monthlyRent;
    private double propertyTaxRate;
    private double insuranceAnnual;
    private double maintenancePercent;
    private double vacancyPercent;
    private double managementPercent;
    private double closingCostPercent;
    private double rehabCost;
    
    // Getters and setters
}

// CashflowResponse.java
public class CashflowResponse {
    private double monthlyMortgage;
    private double monthlyExpenses;
    private double monthlyCashflow;
    private double annualCashflow;
    private double cashOnCashReturn;
    private double capRate;
    private double irr;
    private double totalCashNeeded;
    
    // Getters and setters
}
```

---

## Business Logic

### Mortgage Calculation

```java
/**
 * Monthly mortgage payment using amortization formula
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
private double calculateMortgage(double principal, double downPaymentPct, 
                                  double annualRate, int years) {
    double loanAmount = principal * (1 - downPaymentPct / 100);
    double monthlyRate = annualRate / 100 / 12;
    int totalPayments = years * 12;
    
    if (monthlyRate == 0) return loanAmount / totalPayments;
    
    return loanAmount * 
           (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
           (Math.pow(1 + monthlyRate, totalPayments) - 1);
}
```

### Cash-on-Cash Return

```java
/**
 * Cash-on-Cash Return = Annual Cashflow / Total Cash Invested
 */
private double calculateCashOnCash(double annualCashflow, CashflowRequest request) {
    double downPayment = request.getPurchasePrice() * 
                        (request.getDownPaymentPercent() / 100);
    double closingCosts = request.getPurchasePrice() * 
                         (request.getClosingCostPercent() / 100);
    double totalCashInvested = downPayment + closingCosts + request.getRehabCost();
    
    return (annualCashflow / totalCashInvested) * 100;
}
```

### Cap Rate

```java
/**
 * Cap Rate = NOI / Property Value
 * NOI = Annual Rent - Annual Operating Expenses (excluding mortgage)
 */
private double calculateCapRate(CashflowRequest request) {
    double annualRent = request.getMonthlyRent() * 12;
    double annualExpenses = calculateAnnualExpenses(request);
    double noi = annualRent - annualExpenses;
    
    return (noi / request.getPurchasePrice()) * 100;
}
```

### IRR Calculation (Newton-Raphson Method)

```java
/**
 * Internal Rate of Return using iterative Newton-Raphson method
 */
private double calculateIRR(double[] cashflows) {
    double irr = 0.1; // Initial guess 10%
    double tolerance = 0.0001;
    int maxIterations = 100;
    
    for (int i = 0; i < maxIterations; i++) {
        double npv = 0;
        double derivativeNpv = 0;
        
        for (int t = 0; t < cashflows.length; t++) {
            npv += cashflows[t] / Math.pow(1 + irr, t);
            if (t > 0) {
                derivativeNpv -= t * cashflows[t] / Math.pow(1 + irr, t + 1);
            }
        }
        
        double newIrr = irr - npv / derivativeNpv;
        
        if (Math.abs(newIrr - irr) < tolerance) {
            return newIrr * 100;
        }
        
        irr = newIrr;
    }
    
    return irr * 100;
}
```

---

## Testing

### Frontend Testing

```bash
cd real-time-real-estate-analyzer/real-time-analyzer

# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- AuthPage.test.tsx
```

### Backend Testing

```bash
cd googlemapv2

# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=CashflowServiceTest

# Run with coverage
mvn test jacoco:report
```

### Writing Tests

**Frontend (Jest + React Testing Library):**
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PropertyForm from './PropertyForm';

describe('PropertyForm', () => {
  it('renders form fields', () => {
    render(<PropertyForm onSubmit={jest.fn()} />);
    expect(screen.getByLabelText('Purchase Price')).toBeInTheDocument();
    expect(screen.getByLabelText('Monthly Rent')).toBeInTheDocument();
  });

  it('submits form with correct values', () => {
    const handleSubmit = jest.fn();
    render(<PropertyForm onSubmit={handleSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Purchase Price'), {
      target: { value: '300000' }
    });
    fireEvent.click(screen.getByText('Calculate'));
    
    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ purchasePrice: 300000 })
    );
  });
});
```

**Backend (JUnit 5):**
```java
@SpringBootTest
class CashflowServiceTest {

    @Autowired
    private CashflowService cashflowService;

    @Test
    void shouldCalculateCorrectMortgagePayment() {
        CashflowRequest request = new CashflowRequest();
        request.setPurchasePrice(300000);
        request.setDownPaymentPercent(20);
        request.setInterestRate(7.0);
        request.setLoanTermYears(30);

        CashflowResponse response = cashflowService.calculate(request);

        assertEquals(1596.73, response.getMonthlyMortgage(), 0.01);
    }

    @Test
    void shouldCalculatePositiveCashflow() {
        CashflowRequest request = createSampleRequest();
        request.setMonthlyRent(2500);

        CashflowResponse response = cashflowService.calculate(request);

        assertTrue(response.getMonthlyCashflow() > 0);
    }
}
```

---

## Deployment

### Build for Production

**Frontend:**
```bash
cd real-time-real-estate-analyzer/real-time-analyzer
npm run build
```

**Backend:**
```bash
cd googlemapv2
mvn clean package -DskipTests
```

### Docker Deployment

**Dockerfile (Frontend):**
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Dockerfile (Backend):**
```dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/googlemapv2-1.0.0.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  frontend:
    build: ./real-time-real-estate-analyzer/real-time-analyzer
    ports:
      - "3000:80"
    environment:
      - REACT_APP_API_URL=http://backend:8080

  backend:
    build: ./googlemapv2
    ports:
      - "8080:8080"
    environment:
      - RAPIDAPI_KEY=${RAPIDAPI_KEY}
```

---

## Code Style

### TypeScript/React

- Use functional components with hooks
- Define interfaces for all props
- Use descriptive variable names
- Keep components focused and small
- Use CSS modules or styled-components

### Java

- Follow Google Java Style Guide
- Use meaningful class and method names
- Document public methods with Javadoc
- Keep methods short (< 30 lines)
- Use dependency injection

### Git Commits

```
feat: Add property comparison feature
fix: Resolve map marker positioning issue
docs: Update API documentation
test: Add unit tests for cashflow service
refactor: Simplify mortgage calculation logic
```

---

*December 2025*
