# User Guide

## Contents

- [Introduction](#introduction)
- [System Requirements](#system-requirements)
- [Installation](#installation-guide)
- [API Keys](#getting-api-keys)
- [Running the App](#running-the-application)
- [How to Use It](#using-the-application)
- [Troubleshooting](#troubleshooting)
- [FAQ](#faq)

---

## Introduction

This guide covers setup and usage for the Real-Time Real Estate Investment Analysis app. With it you can search US properties, run cashflow numbers, compare deals, and export reports.

---

## System Requirements

### Minimum

Windows 10+, macOS 10.15+, or Linux. 8 GB RAM, 2 GB disk space. Modern browser (Chrome, Firefox, Safari, Edge).

### Software You Need

- Node.js 18+ from [nodejs.org](https://nodejs.org/)
- Java 17+ from [adoptium.net](https://adoptium.net/)
- Maven 3.8+ from [maven.apache.org](https://maven.apache.org/)
- Git from [git-scm.com](https://git-scm.com/)

---

## Installation Guide

### Step 1: Install Prerequisites

#### Windows

1. **Install Node.js:**
   - Download from [nodejs.org](https://nodejs.org/)
   - Run the installer and follow prompts
   - Verify: `node --version`

2. **Install Java 17:**
   - Download from [adoptium.net](https://adoptium.net/)
   - Run the installer
   - Set JAVA_HOME environment variable
   - Verify: `java -version`

3. **Install Maven:**
   - Download from [maven.apache.org](https://maven.apache.org/download.cgi)
   - Extract to `C:\Program Files\Apache\maven`
   - Add to PATH: `C:\Program Files\Apache\maven\bin`
   - Verify: `mvn -version`

#### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node@18
brew install openjdk@17
brew install maven

# Verify installations
node --version
java -version
mvn -version
```

#### Linux (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Java 17
sudo apt install -y openjdk-17-jdk

# Install Maven
sudo apt install -y maven

# Verify installations
node --version
java -version
mvn -version
```

### Step 2: Clone the Repository

```bash
git clone https://github.com/praneeth-vadrevu/Real-Time-Real-Estate-Investment-Analysis--Web-App.git
cd Real-Time-Real-Estate-Original
```

### Step 3: Install Dependencies

**Backend:**
```bash
cd googlemapv2
mvn clean install
```

**Frontend:**
```bash
cd real-time-real-estate-analyzer/real-time-analyzer
npm install
```

---

## Getting API Keys

You need a few API keys. All have free tiers.

### 1. RapidAPI Key (Zillow & Google API 31)

This single key provides access to both Zillow and Google API 31 services.

1. Go to [RapidAPI](https://rapidapi.com/)
2. Create a free account
3. Subscribe to these APIs:
   - [Zillow API](https://rapidapi.com/apimaker/api/zillow-com1) (Free tier available)
   - [Google API 31](https://rapidapi.com/datascraper/api/google-api31) (Free tier available)
4. Copy your RapidAPI key from the dashboard

### 2. Google OAuth Client ID

Required for user authentication.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure consent screen if prompted
6. Select "Web application"
7. Add authorized JavaScript origins:
   - `http://localhost:3000`
8. Add authorized redirect URIs:
   - `http://localhost:3000`
9. Copy the Client ID

### 3. Mapbox Access Token

Required for interactive maps.

1. Go to [Mapbox](https://account.mapbox.com/)
2. Create a free account
3. Navigate to "Access tokens"
4. Copy your default public token or create a new one

---

## Running the Application

### Method 1: Using Scripts (Recommended)

**Windows:**
```powershell
# Start Backend
cd googlemapv2
.\start-backend.bat

# In a new terminal, start Frontend
cd real-time-real-estate-analyzer\real-time-analyzer
npm start
```

**macOS/Linux:**
```bash
# Start Backend
cd googlemapv2
./start-backend.sh

# In a new terminal, start Frontend
cd real-time-real-estate-analyzer/real-time-analyzer
npm start
```

### Method 2: Manual Start

**Start Backend:**
```bash
cd googlemapv2

# Set API key (Windows PowerShell)
$env:RAPIDAPI_KEY = "your-rapidapi-key-here"

# Or Linux/macOS
export RAPIDAPI_KEY="your-rapidapi-key-here"

# Run
mvn spring-boot:run
```

**Start Frontend:**
```bash
cd real-time-real-estate-analyzer/real-time-analyzer

# Create .env file
echo "REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id" > .env
echo "REACT_APP_MAPBOX_TOKEN=your-mapbox-token" >> .env

# Run
npm start
```

### Accessing the Application

Once both services are running:

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8080

---

## Using the Application

### Landing Page & Login

When you open the app you see login options. Click "Sign in with Google" for full access, or "Continue as Guest" for limited features.

### Dashboard

The dashboard shows your saved properties. Use the sidebar to switch strategies, the main area to view deals, and the "+" button to add new ones.

### Property Search

Go to "Search Properties", type a city/state/ZIP, and results show up on the map. Click any property for details, then "Save" to add it to your portfolio.

### Investment Analysis

Pick a property from your portfolio. The app calculates monthly cashflow, cash-on-cash, cap rate, and IRR. You can tweak the inputs (down payment, rate, etc.) and recalculate.

### Property Comparison

Select multiple properties and hit "Compare" to see them side by side. Export as needed.

### Reports

Select a property, click "Generate Report", pick PDF or HTML, and download.

---

## Troubleshooting

### Backend Problems

**Problem:** `mvn: command not found`
```bash
# Add Maven to PATH
# Windows: Add C:\Program Files\Apache\maven\bin to system PATH
# macOS/Linux: Add to ~/.bashrc or ~/.zshrc
export PATH=$PATH:/path/to/maven/bin
```

**Problem:** `Port 8080 already in use`
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <pid> /F

# macOS/Linux
lsof -i :8080
kill -9 <pid>
```

**Problem:** `RAPIDAPI_KEY not set`
```bash
# Ensure environment variable is set before running
# Windows PowerShell
$env:RAPIDAPI_KEY = "your-key"

# Linux/macOS
export RAPIDAPI_KEY="your-key"
```

### Frontend Issues

**Problem:** `npm: command not found`
- Reinstall Node.js from [nodejs.org](https://nodejs.org/)

**Problem:** `Module not found` errors
```bash
rm -rf node_modules
npm install
```

**Problem:** Map not loading
- Verify REACT_APP_MAPBOX_TOKEN in .env file
- Check browser console for errors
- Ensure Mapbox token has correct permissions

### Authentication Issues

**Problem:** Google login not working
- Verify REACT_APP_GOOGLE_CLIENT_ID in .env
- Check Google Cloud Console for correct redirect URIs
- Ensure OAuth consent screen is configured

---

## API Endpoints

### Backend APIs (What's Implemented)

The Spring Boot backend exposes these endpoints:

**Zillow API Endpoints (via RapidAPI):**
- `GET /api/properties/search` - Search properties by location
- `GET /api/properties/{zpid}` - Get property details by ZPID

**Cashflow Analysis:**
- `POST /api/analysis/cashflow` - Calculate investment metrics (NOI, Cap Rate, IRR, etc.)

**Google API 31 Endpoints (backend only, not used by frontend):**
- `GET /api/geo/text` - Text-based place search
- `GET /api/geo/circle` - Radius-based location search
- `POST /api/geo/raw` - Raw query passthrough

### Frontend Integration (What's Actually Connected)

The React frontend currently calls these APIs:

**Backend API Calls:**

- `/api/properties/search` - Called in `SearchPage.tsx`, `PropertySearch.tsx` for Zillow property search
- `/api/properties/{zpid}` - Called in `PropertyForm.tsx` for Zillow property details
- `/api/analysis/cashflow` - Called in `cashflowApi.ts` for investment calculations

**Direct External Calls (not through backend):**

- Mapbox API - Called in `PropertyMap.tsx` for map display and geocoding
- Google OAuth - Called in `AuthContext.tsx` for user login

**Not Connected:** The backend implements Google API 31 geo endpoints (`/api/geo/*`) for geocoding and place search, but the frontend uses Mapbox directly instead. These endpoints remain available for future features like nearby amenities or walkability scoring.

### Quick API Tests

Test the active backend APIs (example values shown):

```bash
# Test property search
curl "http://localhost:8080/api/properties/search?location=Santa%20Monica,%20CA&status=for_sale"

# Test property details (example ZPID)
curl "http://localhost:8080/api/properties/20479916"

# Test cashflow analysis (example values, not defaults)
curl -X POST "http://localhost:8080/api/analysis/cashflow" \
  -H "Content-Type: application/json" \
  -d '{"offerPrice": 300000, "grossRentsAnnual": 36000, "firstPrincipal": 240000, "firstRateAnnual": 0.07}'
```

Test the backend-only Google Geo APIs (not used by frontend):

```bash
# Text-based place search
curl "http://localhost:8080/api/geo/text?text=coffee&city=Santa%20Monica&state=CA"

# Circular range search
curl "http://localhost:8080/api/geo/circle?lat=34.0195&lon=-118.4912&radius=5000&text=restaurant"
```

---

## FAQ

### General

**Q: Is the application free to use?**
A: The application itself is open source. However, the external APIs (Zillow, Google API 31, Mapbox) have free tiers with usage limits. For heavy use, paid plans may be required.

**Q: Can I use this for commercial purposes?**
A: Please check the API provider terms of service. Zillow API has specific restrictions on commercial use.

**Q: Does the application store my data?**
A: Currently, property data is stored locally in your browser. No data is sent to external servers beyond the API calls.

### Technical Questions

**Q: Which browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (latest versions). Internet Explorer is not supported.

**Q: Can I run this on a server?**
A: Yes, both frontend and backend can be deployed to cloud services. See DEVELOPER_GUIDE.md for deployment instructions.

**Q: How accurate is the investment analysis?**
A: The calculations are based on industry-standard formulas. However, actual results may vary based on market conditions, property-specific factors, and other variables.

### API Questions

**Q: Why am I getting API errors?**
A: Common causes:
- Invalid or expired API key
- API rate limit exceeded
- Network connectivity issues

**Q: What's the API rate limit?**
A: Free tier limits vary by provider:
- Zillow API: ~100 requests/month
- Google API 31: ~100 requests/month
- Mapbox: 50,000 map loads/month

---

## Help

Check the [GitHub Issues](https://github.com/praneeth-vadrevu/Real-Time-Real-Estate-Investment-Analysis--Web-App/issues) or the [Developer Guide](./DEVELOPER_GUIDE.md).

---

*December 2025*
