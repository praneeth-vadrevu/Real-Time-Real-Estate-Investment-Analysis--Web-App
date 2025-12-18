# Real-Time Real Estate Investment Analysis Web Application

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-green.svg)](https://spring.io/projects/spring-boot)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue.svg)](https://www.typescriptlang.org/)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Full-stack web app for real estate investment analysis. Search properties, run cashflow numbers, compare strategies (Rental, BRRRR, Flip, Wholesale), and export reports.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#system-architecture)
- [Tech Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#quick-start)
- [Config](#configuration)
- [API Docs](#api-documentation)
- [Docs](#related-documentation)
- [Contributing](#contributing)

---

## Overview

This app helps real estate investors analyze deals quickly. It pulls live data from Zillow, runs the numbers on different investment strategies, and shows everything on a map.

What it does:
- Search properties anywhere in the US (Zillow data)
- Run cashflow analysis, calculate ROI, Cap Rate, IRR
- Compare deals side by side
- Support for Rental, BRRRR, Flip, and Wholesale strategies
- Export reports
- Google login

---

## Features

**Frontend**
- Dashboard to manage your saved properties
- Search by city, zip, price range
- Cashflow calculators for different strategies
- Compare multiple properties
- Mapbox maps with markers
- PDF/HTML reports
- Works on mobile
- Google login

**Backend**
- REST API
- Zillow data (prices, Zestimate, rent estimates)
- Google API 31 geocoding
- Cashflow engine
- CORS enabled

**Strategies**
- Rental (buy & hold)
- BRRRR
- Fix & Flip
- Wholesale

---

## Architecture

**Client Layer (React Frontend)**
- Components: AuthPage, Dashboard, SearchPage, PropertyComparison, ReportViewer
- State: AuthContext, PropertiesContext
- Communicates via HTTP/REST

**Server Layer (Spring Boot)**
- Controllers: PropertyController, GeoController, CashflowController
- Services: ZillowService, GoogleApi31Service, CashflowService

**External Services**
- Zillow API (RapidAPI) - property data
- Google API 31 (RapidAPI) - geocoding
- Mapbox API (direct from frontend) - maps

---

## Tech Stack

### Frontend
- React 19.2.0
- TypeScript 4.9.5
- Mapbox GL JS 3.16.0, react-map-gl 8.1.0
- @react-oauth/google 0.12.2
- react-icons 5.5.0
- Create React App 5.0.1

### Backend
- Spring Boot 3.2.0
- Java 17
- Maven 3.8+
- Jackson 2.15.x
- Java HttpClient (JDK 17)

### External APIs

**Backend implements:**
- Zillow API (RapidAPI) - Property search, details, Zestimate
- Google API 31 (RapidAPI) - Geocoding, place search
- Cashflow Engine (built-in) - Investment calculations

**Frontend connects to:**
- Zillow via backend (`/api/properties/*`) - Property data
- Cashflow via backend (`/api/analysis/cashflow`) - ROI calculations
- Mapbox (direct) - Maps and geocoding
- Google OAuth (direct) - User login

**Note:** The backend implements Google API 31 endpoints (`/api/geo/*`) for geocoding, but the frontend does not use them - it calls Mapbox directly instead. These endpoints remain available for future features.

---

## Project Structure

**docs/**: All documentation files (USER_GUIDE.md, DEVELOPER_GUIDE.md, etc.)

**Frontend** (real-time-real-estate-analyzer/real-time-analyzer/):
- src/App.tsx - Main component
- src/components/ - AuthPage, Dashboard, SearchPage, PropertyMap, PropertyForm, PropertyComparison, etc.
- src/context/ - AuthContext, PropertiesContext
- src/utils/ - cashflowApi.ts, reportGenerator.ts

**Backend** (googlemapv2/):
- pom.xml - Maven config
- src/main/java/.../GoogleApi31Service.java - Geo service
- src/main/java/.../CashflowController.java - REST API
- src/main/java/.../CashflowService.java - Business logic
- src/main/resources/application.yml - Config

**Standalone Modules**:
- cashflow-calculator/ - Standalone calculator
- zillow api/ - Zillow API client

---

## Quick Start

You'll need Node.js 18+, Java 17+, Maven 3.8+, and some API keys (covered below).

### 1. Clone the Repository

```bash
git clone https://github.com/praneeth-vadrevu/Real-Time-Real-Estate-Investment-Analysis--Web-App.git
cd Real-Time-Real-Estate-Original
```

### 2. Start the Backend

```bash
cd googlemapv2

# Set environment variables (Windows PowerShell)
$env:RAPIDAPI_KEY = "your-rapidapi-key"

# Build and run
mvn clean install
mvn spring-boot:run
```

Backend will start at: `http://localhost:8080`

### 3. Start the Frontend

```bash
cd real-time-real-estate-analyzer/real-time-analyzer

# Install dependencies
npm install

# Set environment variables
# Create .env file with:
# REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
# REACT_APP_MAPBOX_TOKEN=your-mapbox-token

# Start development server
npm start
```

Frontend will start at: `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000`

---

## Configuration

### API Keys

You need three keys:
- **RAPIDAPI_KEY** - Get from [RapidAPI](https://rapidapi.com/), covers both Zillow and Google API 31
- **REACT_APP_GOOGLE_CLIENT_ID** - From [Google Cloud Console](https://console.cloud.google.com/)
- **REACT_APP_MAPBOX_TOKEN** - From [Mapbox](https://account.mapbox.com/)

### Backend Configuration (application.yml)

```yaml
server:
  port: 8080

rapidapi:
  key: ${RAPIDAPI_KEY}
  zillow:
    host: zillow-com1.p.rapidapi.com
  google:
    host: google-api31.p.rapidapi.com

cors:
  allowed-origins: http://localhost:3000
```

### Frontend Configuration (.env)

```env
REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
REACT_APP_MAPBOX_TOKEN=pk.your-mapbox-token
REACT_APP_API_URL=http://localhost:8080
```

---

## API Documentation

### Backend REST Endpoints

#### Property Search
```http
GET /api/zillow/search?location={location}&page={page}
```

#### Property Details
```http
GET /api/zillow/property/{zpid}
```

#### Zestimate
```http
GET /api/zillow/zestimate/{zpid}
```

#### Cashflow Analysis
```http
POST /api/cashflow/calculate
Content-Type: application/json
```

Example request (sample values, not defaults):
```json
{
  "purchasePrice": 300000,
  "downPaymentPercent": 20,
  "interestRate": 7.0,
  "loanTermYears": 30,
  "monthlyRent": 2500,
  "propertyTaxRate": 1.2,
  "insuranceAnnual": 1500,
  "maintenancePercent": 5,
  "vacancyPercent": 5,
  "managementPercent": 8
}
```

#### Geocoding (Backend only - not used by frontend)
```http
GET /api/google/geocode?address={address}
```

For complete API documentation, see [Backend Developer Guide](./docs/BACKEND_DEVELOPER_GUIDE.md).

---

## Other Docs

- [User Guide](./docs/USER_GUIDE.md) - How to install and use
- [Developer Guide](./docs/DEVELOPER_GUIDE.md) - Technical reference
- [Backend README](./docs/BACKEND_README.md) - Backend overview
- [Backend User Guide](./docs/BACKEND_USER_GUIDE.md) - Backend setup
- [Backend Developer Guide](./docs/BACKEND_DEVELOPER_GUIDE.md) - Backend API reference
- [Cashflow Calculator](./cashflow-calculator/README.md) - Calculator module

---

## Development

### Tests

**Frontend:**
```bash
cd real-time-real-estate-analyzer/real-time-analyzer
npm test
```

**Backend:**
```bash
cd googlemapv2
mvn test
```

### Building for Production

**Frontend:**
```bash
npm run build
```

**Backend:**
```bash
mvn clean package -DskipTests
java -jar target/googlemapv2-1.0.0.jar
```

---

## Contributing

Fork it, create a branch, make changes, push, and open a PR.

---

## License

MIT License. See [LICENSE](LICENSE).

---

## Credits

Built with [Zillow API](https://rapidapi.com/apimaker/api/zillow-com1), [Mapbox](https://www.mapbox.com/), [Spring Boot](https://spring.io/projects/spring-boot), and [React](https://reactjs.org/).

---

## Contact

**Authors:** Xiangtao Fu, VS Praneeth, Sireesha Baratam

**Repository:** [GitHub](https://github.com/praneeth-vadrevu/Real-Time-Real-Estate-Investment-Analysis--Web-App)

**Course:** CS 682, Fall 2025

---

*Last Updated: December 2025*