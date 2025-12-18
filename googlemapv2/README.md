# Real-Time Real Estate Backend Service

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green.svg)](https://spring.io/projects/spring-boot)
[![Maven](https://img.shields.io/badge/Maven-3.8+-blue.svg)](https://maven.apache.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Spring Boot backend for real estate investment analysis. REST APIs for property search, geocoding, and cashflow calculations.

---

## Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [API Documentation](#api-documentation)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Related Documentation](#related-documentation)

---

## Overview

This backend is part of the Real-Time Real Estate Investment Analysis app. It handles:
- Zillow API calls for property data and estimates
- Google API geocoding and place search
- Cashflow calculations and investment metrics

### Technology Stack

- Java 17
- Spring Boot 3.2.0
- Maven 3.8+
- Jackson 2.15.x
- Java HttpClient (JDK 17)

---

## Features

### Property Services
- Extended property search by location
- Property details retrieval by ZPID
- Zestimate and rent estimates
- Property comparables (comps)
- Price and tax history
- 3D tours and floor plans

### Geolocation Services
- Text-based place search
- Coordinate-based radius search
- Address geocoding

### Investment Analysis
- Net Operating Income (NOI) calculation
- Cap Rate analysis (Purchase Price & FMV)
- Debt Service Coverage Ratio (DSCR)
- Cash-on-Cash Return
- Internal Rate of Return (IRR)
- Multi-year cashflow projections
- Equity Multiple calculation

---

## Architecture

**Frontend (React)** sends HTTP/REST requests to:

**Spring Boot Backend** containing:
- PropertyController -> ZillowService -> Zillow API (RapidAPI)
- GeoController -> GoogleApi31Service -> Google API 31 (RapidAPI)
- CashflowController -> CashflowService (built-in calculations)

---

## Quick Start

### What You Need

- Java 17+ from [adoptium.net](https://adoptium.net/)
- Maven 3.8+ from [maven.apache.org](https://maven.apache.org/download.cgi)
- RapidAPI key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/praneeth-vadrevu/Real-Time-Real-Estate-Investment-Analysis--Web-App.git
   cd Real-Time-Real-Estate-Investment-Analysis--Web-App/googlemapv2
   ```

2. **Set environment variables**
   ```bash
   # Windows (PowerShell)
   $env:RAPIDAPI_KEY = "your-rapidapi-key-here"
   
   # Linux/macOS
   export RAPIDAPI_KEY="your-rapidapi-key-here"
   ```

3. **Build the project**
   ```bash
   mvn clean install
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

5. **Verify the server is running**
   ```bash
   curl http://localhost:8080/api/geo/text?text=test
   ```

### Using Batch Scripts (Windows)

```batch
# Compile the project
compile.bat

# Start the backend server
start-backend.bat
```

---

## API Reference

### Base URL
```
http://localhost:8080
```

### Endpoints Overview

- `GET /api/properties/search` - Search properties by location
- `GET /api/properties/{zpid}` - Get property details
- `POST /api/analysis/cashflow` - Analyze investment cashflow
- `GET /api/geo/text` - Text-based place search
- `GET /api/geo/circle` - Radius-based search
- `POST /api/geo/raw` - Raw geo query

### Detailed API Reference

#### 1. Property Search
```http
GET /api/properties/search?location={location}&status={status}&page={page}
```

**Parameters:**
- `location` (string, required) - City, state, or ZIP code
- `status` (string, optional) - for_sale, for_rent, sold
- `page` (integer, optional) - Page number, default 1

**Example:**
```bash
curl "http://localhost:8080/api/properties/search?location=Santa%20Monica,%20CA&status=for_sale"
```

#### 2. Property Details
```http
GET /api/properties/{zpid}
```

**Example:**
```bash
curl "http://localhost:8080/api/properties/20479916"
```

**Response:**
```json
{
  "zpid": "20479916",
  "address": "123 Main St, Santa Monica, CA 90401",
  "price": 1500000,
  "bedrooms": 3,
  "bathrooms": 2,
  "livingArea": 1800,
  "yearBuilt": 1985,
  "zestimate": 1450000,
  "rentEstimate": 5500,
  "annualTax": 15000,
  "hoaMonthly": 350
}
```

#### 3. Cashflow Analysis
```http
POST /api/analysis/cashflow
Content-Type: application/json
```

**Request Body:**
```json
{
  "offerPrice": 500000,
  "fmv": 550000,
  "grossRentsAnnual": 48000,
  "numberOfUnits": 4,
  "vacancyRate": 0.05,
  "managementRate": 0.10,
  "propertyTaxes": 6000,
  "insurance": 2400,
  "firstPrincipal": 400000,
  "firstRateAnnual": 0.07,
  "firstAmortYears": 30,
  "holdYears": 10
}
```

**Response:**
```json
{
  "summary": {
    "rpp": 500000,
    "cashToClose": 100000,
    "noiY1": 35000,
    "capRatePPY1": 0.07,
    "dscrY1": 1.15,
    "cashOnCashY1": 0.085,
    "irr": 0.12,
    "equityMultiple": 2.1
  },
  "projection": [
    { "year": 1, "noi": 35000, "cashFlowBeforeTax": 8500 },
    { "year": 2, "noi": 36050, "cashFlowBeforeTax": 9100 }
  ]
}
```

#### 4. Geo Text Search
```http
GET /api/geo/text?text={text}&city={city}&state={state}
```

**Example:**
```bash
curl "http://localhost:8080/api/geo/text?text=white%20house&city=washington&state=DC"
```

#### 5. Geo Circle Search
```http
GET /api/geo/circle?lat={lat}&lon={lon}&radius={radius}&text={text}
```

**Example:**
```bash
curl "http://localhost:8080/api/geo/circle?lat=34.0195&lon=-118.4912&radius=5000&text=restaurant"
```

---

## Configuration

### Application Configuration (`application.yml`)

```yaml
server:
  port: 8080

zillow:
  rapidapi:
    host: zillow-com1.p.rapidapi.com
    key: ${RAPIDAPI_KEY:your-default-key}

googleapi31:
  rapidapi:
    host: google-api31.p.rapidapi.com
    key: ${RAPIDAPI_KEY:your-default-key}
  endpoint: https://google-api31.p.rapidapi.com/map
```

### Environment Variables

- `RAPIDAPI_KEY` (required) - RapidAPI authentication key
- `SERVER_PORT` (optional) - Server port, default 8080

---

## Project Structure

**src/main/java/com/example/**
- map/Application.java - Main entry point
- map/config/CorsConfig.java - CORS config
- map/geo/GeoController.java - Geo REST endpoints
- map/geo/GoogleApi31Service.java - Google API client
- realestate/controller/PropertyController.java
- realestate/model/EnrichedProperty.java, SearchCard.java
- realestate/service/ZillowService.java
- analysis/controller/CashflowController.java
- analysis/dto/CashflowRequest.java, CashflowResponse.java
- analysis/service/CashflowService.java

**src/main/resources/** - application.yml

**Root files**: pom.xml, README.md, USER_GUIDE.md, DEVELOPER_GUIDE.md

---

## Other Docs

- [USER_GUIDE.md](USER_GUIDE.md) - Setup and usage
- [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) - Technical docs
- [API Reference](test-requests.http) - HTTP request examples

---

## Troubleshooting

### Common Problems

**1. Port 8080 already in use**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/macOS
lsof -i :8080
kill -9 <PID>
```

**2. API Key errors**
- Verify `RAPIDAPI_KEY` environment variable is set
- Check RapidAPI subscription status
- Ensure API key has access to required endpoints

**3. CORS errors**
- Backend includes CORS configuration for `localhost:3000`
- Add additional origins in `CorsConfig.java` if needed

---

## License

MIT License - see [LICENSE](../LICENSE).

---

## Contributors

Praneeth Vadrevu (CS 682, Fall 2025)

---

## Help

Open an issue on the [GitHub repo](https://github.com/praneeth-vadrevu/Real-Time-Real-Estate-Investment-Analysis--Web-App/issues).
