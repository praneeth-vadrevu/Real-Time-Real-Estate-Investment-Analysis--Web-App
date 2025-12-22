# User Guide - Real-Time Real Estate Investment Analysis

> **Version:** 1.0.0  
> **Last Updated:** December 2025  
> **Audience:** End Users, System Administrators

---

## Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Installation Guide](#3-installation-guide)
4. [API Keys Configuration](#4-api-keys-configuration)
5. [Backend Setup and Running](#5-backend-setup-and-running)
6. [Frontend Setup and Running](#6-frontend-setup-and-running)
7. [Using the Application](#7-using-the-application)
8. [Troubleshooting](#8-troubleshooting)
9. [FAQ](#9-faq)

---

## 1. Introduction

### What is this application?

The Real-Time Real Estate Investment Analysis application is a full-stack web application that helps real estate investors:

- **Search Properties**: Find properties across the United States using Zillow data
- **Analyze Investments**: Calculate cashflow, cap rates, IRR, and other key metrics
- **Compare Deals**: Side-by-side comparison of multiple properties
- **Generate Reports**: Export detailed investment analysis reports
- **Visualize Properties**: Interactive maps with property locations

### Application Architecture

The application consists of two main components:

- **Backend (Spring Boot)**: REST API server running on port 8080
  - Handles property search via Zillow API
  - Performs investment calculations
  - Provides geocoding services

- **Frontend (React)**: Web interface running on port 3000
  - User interface for property search and analysis
  - Interactive MapBox maps
  - Google OAuth authentication

---

## 2. System Requirements

### Minimum Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM**: 8 GB minimum
- **Disk Space**: 2 GB free space
- **Internet Connection**: Required for API calls
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

### Required Software

- **Node.js**: Version 18 or higher ([Download](https://nodejs.org/))
- **Java**: JDK 17 or higher ([Download](https://adoptium.net/))
- **Maven**: Version 3.8 or higher ([Download](https://maven.apache.org/))
- **Git**: Version 2.30 or higher ([Download](https://git-scm.com/))

---

## 3. Installation Guide

### Step 1: Install Prerequisites

#### Windows

1. **Install Node.js:**
   - Download from [nodejs.org](https://nodejs.org/)
   - Run the installer and follow the prompts
   - Verify installation:
     ```powershell
     node --version
     npm --version
     ```

2. **Install Java 17:**
   - Download from [adoptium.net](https://adoptium.net/)
   - Run the installer
   - Set JAVA_HOME environment variable:
     - Open System Properties → Environment Variables
     - Add new variable: `JAVA_HOME` = `C:\Program Files\Eclipse Adoptium\jdk-17.x.x`
     - Add to PATH: `%JAVA_HOME%\bin`
   - Verify installation:
     ```powershell
     java -version
     ```

3. **Install Maven:**
   - Download from [maven.apache.org](https://maven.apache.org/download.cgi)
   - Extract to `C:\Program Files\Apache\maven`
   - Add to System PATH: `C:\Program Files\Apache\maven\bin`
   - Verify installation:
     ```powershell
     mvn -version
     ```

#### macOS

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js 18
brew install node@18

# Install Java 17
brew install openjdk@17

# Add Java to PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Install Maven
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
cd Real-Time-Real-Estate-Investment-Analysis--Web-App
```

### Step 3: Install Dependencies

**Backend Dependencies:**
```bash
cd googlemapv2
mvn clean install
```

**Frontend Dependencies:**
```bash
cd real-time-real-estate-analyzer/real-time-analyzer
npm install
```

---

## 4. API Keys Configuration

You need to obtain and configure the following API keys:

### 4.1 RapidAPI Key (Zillow & Google API 31)

This single key provides access to both Zillow and Google API 31 services for the backend.

1. Go to [RapidAPI](https://rapidapi.com/)
2. Create a free account
3. Subscribe to these APIs:
   - [Zillow API](https://rapidapi.com/apimaker/api/zillow-com1) (Free tier available)
   - [Google API 31](https://rapidapi.com/datascraper/api/google-api31) (Free tier available)
4. Copy your RapidAPI key from the dashboard
5. This key will be used in the backend configuration (see Backend Setup section)

### 4.2 MapBox Access Token

Required for interactive maps in the frontend.

1. Go to [Mapbox](https://account.mapbox.com/)
2. Create a free account
3. Navigate to "Access tokens" in your account dashboard
4. Copy your default public token or create a new one
5. This token will be used in the frontend `.env` file (see Frontend Setup section)

### 4.3 Google OAuth Client ID

Required for user authentication in the frontend.

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Configure the OAuth consent screen if prompted:
   - Choose "External" user type
   - Fill in required information
   - Add scopes: `email`, `profile`
6. Create OAuth client ID:
   - Application type: "Web application"
   - Name: "Real Estate Investment App"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000`
7. Copy the Client ID
8. This ID will be used in the frontend `.env` file (see Frontend Setup section)

---

## 5. Backend Setup and Running

### 5.1 Backend Configuration

The backend requires a RapidAPI key to access Zillow and Google API 31 services.

**Option 1: Environment Variable (Recommended)**

**Windows PowerShell:**
```powershell
$env:RAPIDAPI_KEY = "your-rapidapi-key-here"
```

**Windows Command Prompt:**
```cmd
set RAPIDAPI_KEY=your-rapidapi-key-here
```

**macOS/Linux:**
```bash
export RAPIDAPI_KEY="your-rapidapi-key-here"
```

**Option 2: Configuration File**

Edit `googlemapv2/src/main/resources/application.yml`:

```yaml
zillow:
  rapidapi:
    host: zillow-com1.p.rapidapi.com
    key: your-rapidapi-key-here

googleapi31:
  rapidapi:
    host: google-api31.p.rapidapi.com
    key: your-rapidapi-key-here
```

### 5.2 Building the Backend

```bash
cd googlemapv2
mvn clean install
```

This will:
- Download all dependencies
- Compile Java source code
- Run tests
- Package the application as a JAR file

### 5.3 Running the Backend

**Method 1: Using Maven (Development)**

```bash
cd googlemapv2
mvn spring-boot:run
```

**Method 2: Using Scripts**

**Windows:**
```powershell
cd googlemapv2
.\start-backend.bat
```

**macOS/Linux:**
```bash
cd googlemapv2
./start-backend.sh
```

**Method 3: Using JAR File (Production)**

```bash
cd googlemapv2
java -jar target/googlemapv2-0.0.1-SNAPSHOT.jar
```

### 5.4 Verifying Backend is Running

Once started, you should see:
```
Started Application in X.XXX seconds
```

The backend will be available at:
- **API Base URL**: `http://localhost:8080`
- **Health Check**: Open `http://localhost:8080/api/properties/search?location=Boston,MA` in your browser

### 5.5 Backend API Endpoints

The backend provides the following REST endpoints:

**Property Search:**
- `GET /api/properties/search?location={location}&status={status}&page={page}`
  - Search properties by location (city, state, or ZIP code)
  - Example: `http://localhost:8080/api/properties/search?location=Boston,MA&status=for_sale`

**Property Details:**
- `GET /api/properties/{zpid}`
  - Get detailed property information by Zillow Property ID
  - Example: `http://localhost:8080/api/properties/20479916`

**Cashflow Analysis:**
- `POST /api/analysis/cashflow`
  - Calculate investment metrics (NOI, Cap Rate, IRR, etc.)
  - Requires JSON request body with property and financial data

**Geocoding (Backend only, not used by frontend):**
- `GET /api/geo/text` - Text-based place search
- `GET /api/geo/circle` - Radius-based location search

---

## 6. Frontend Setup and Running

### 6.1 Frontend Configuration

Create a `.env` file in the frontend directory:

```bash
cd real-time-real-estate-analyzer/real-time-analyzer
```

Create `.env` file:

**Windows PowerShell:**
```powershell
echo "REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here" > .env
echo "REACT_APP_MAPBOX_ACCESS_TOKEN=your-mapbox-token-here" >> .env
```

**macOS/Linux:**
```bash
cat > .env << EOF
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
REACT_APP_MAPBOX_ACCESS_TOKEN=your-mapbox-token-here
EOF
```

**Important Notes:**
- Replace `your-google-client-id-here` with your Google OAuth Client ID
- Replace `your-mapbox-token-here` with your MapBox Access Token
- Do NOT add quotes around the values
- The `.env` file should be in `real-time-real-estate-analyzer/real-time-analyzer/` directory
- Restart the development server after creating or modifying `.env`

### 6.2 Building the Frontend

**Development Build:**
```bash
cd real-time-real-estate-analyzer/real-time-analyzer
npm install
```

**Production Build:**
```bash
npm run build
```

This creates an optimized production build in the `build/` directory.

### 6.3 Running the Frontend

**Development Mode (Hot Reload):**
```bash
cd real-time-real-estate-analyzer/real-time-analyzer
npm start
```

The application will:
- Start on `http://localhost:3000`
- Automatically open in your default browser
- Hot reload when you make code changes

**Production Mode:**
```bash
npm run build
npx serve -s build
```

### 6.4 Verifying Frontend is Running

Once started, you should see:
```
Compiled successfully!

You can now view real-time-real-estate-analyzer in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.x.x:3000
```

Open `http://localhost:3000` in your browser to access the application.

---

## 7. Using the Application

### 7.1 Starting Both Services

You need to run both backend and frontend simultaneously:

**Terminal 1 - Backend:**
```bash
cd googlemapv2
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd real-time-real-estate-analyzer/real-time-analyzer
npm start
```

### 7.2 Application Workflow

#### Step 1: Authentication

1. Open `http://localhost:3000` in your browser
2. You'll see the landing page with authentication options:
   - **Sign in with Google**: Full access with data persistence
   - **Browse as Guest**: Limited features, data stored locally

#### Step 2: Property Search

1. Click "Search Properties" in the navigation bar
2. Enter a location (city, state, or ZIP code) in the search box
   - Example: `Boston, MA` or `90210`
3. Click "Search" or press Enter
4. Results will appear in a list and on the map
5. Click any property to view details
6. Click "Add to My List" to save the property

#### Step 3: Property Analysis

1. Navigate to "My Properties" from the dashboard
2. Click on a property card
3. Fill in the property analysis form:
   - **Property Information**: Address, market value, vacancy rate
   - **Purchase Information**: Offer price, repairs, closing costs
   - **Financing**: Loan amount, interest rate, amortization period
   - **Income**: Annual gross rents
   - **Operating Expenses**: Property taxes, insurance, maintenance
4. Click "Analyze" to calculate metrics:
   - Net Operating Income (NOI)
   - Cap Rate
   - Cash-on-Cash Return
   - Debt Service Coverage Ratio (DSCR)
   - Internal Rate of Return (IRR)
   - Multi-year cashflow projections
5. Review the analysis results
6. Click "Save Property" to add to your portfolio

#### Step 4: Property Comparison

1. Go to "My Properties" dashboard
2. Select multiple properties (they should already be saved)
3. Click "Compare" button
4. View side-by-side comparison of:
   - Property details
   - Financial metrics
   - Investment returns
5. Export comparison if needed

#### Step 5: Generate Reports

1. After analyzing a property, click "Generate Report"
2. Choose report format:
   - **HTML**: View in browser
   - **Download**: Save as HTML file
   - **Print**: Print-friendly format
3. Reports include:
   - Property information
   - Financial analysis
   - Year-by-year projections
   - Key performance indicators

### 7.3 Key Features

**Dashboard:**
- View all saved properties
- Filter by investment strategy (Rental, BRRRR, Flip, Wholesale)
- Search properties by address
- Toggle between list, map, and combined views

**Property Map:**
- Interactive MapBox map showing property locations
- Click markers to view property details
- Geocoding for addresses without coordinates
- Search and filter properties on the map

**Investment Strategies:**
- **Rental**: Long-term buy-and-hold properties
- **BRRRR**: Buy, Rehab, Rent, Refinance, Repeat
- **Flip**: Buy, renovate, and sell for profit
- **Wholesale**: Assign contracts to other investors

---

## 8. Troubleshooting

### 8.1 Backend Issues

**Problem: `mvn: command not found`**
- **Solution**: Add Maven to your system PATH
  - Windows: Add `C:\Program Files\Apache\maven\bin` to System PATH
  - macOS/Linux: Add Maven bin directory to `~/.bashrc` or `~/.zshrc`

**Problem: `Port 8080 already in use`**
- **Solution**: Kill the process using port 8080
  - Windows:
    ```powershell
    netstat -ano | findstr :8080
    taskkill /PID <pid> /F
    ```
  - macOS/Linux:
    ```bash
    lsof -i :8080
    kill -9 <pid>
    ```

**Problem: `RAPIDAPI_KEY not set`**
- **Solution**: Set the environment variable before running
  - Windows PowerShell: `$env:RAPIDAPI_KEY = "your-key"`
  - macOS/Linux: `export RAPIDAPI_KEY="your-key"`

**Problem: API calls failing with 401/403 errors**
- **Solution**: 
  - Verify your RapidAPI key is correct
  - Check that you've subscribed to both Zillow and Google API 31 on RapidAPI
  - Ensure your API key hasn't expired

**Problem: Backend starts but returns empty results**
- **Solution**:
  - Check backend logs for API errors
  - Verify RapidAPI key is set correctly
  - Test API endpoints directly using curl or Postman

### 8.2 Frontend Issues

**Problem: `npm: command not found`**
- **Solution**: Reinstall Node.js from [nodejs.org](https://nodejs.org/)

**Problem: `Module not found` errors**
- **Solution**: Reinstall dependencies
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

**Problem: Map not loading**
- **Solution**:
  - Verify `REACT_APP_MAPBOX_ACCESS_TOKEN` is set in `.env` file
  - Check browser console for MapBox API errors
  - Ensure MapBox token has correct permissions
  - Restart the development server after updating `.env`

**Problem: Google login not working**
- **Solution**:
  - Verify `REACT_APP_GOOGLE_CLIENT_ID` is set in `.env` file
  - Check Google Cloud Console for correct redirect URIs
  - Ensure OAuth consent screen is configured
  - Restart the development server after updating `.env`

**Problem: `Cannot connect to backend` errors**
- **Solution**:
  - Verify backend is running on `http://localhost:8080`
  - Check browser console for CORS errors
  - Ensure both frontend and backend are running
  - Check firewall settings

**Problem: Environment variables not loading**
- **Solution**:
  - Ensure `.env` file is in `real-time-real-estate-analyzer/real-time-analyzer/` directory
  - Variable names must start with `REACT_APP_`
  - Restart the development server after creating/modifying `.env`
  - Do not use quotes around values in `.env`

### 8.3 Application Issues

**Problem: Properties not appearing on map**
- **Solution**:
  - Check that properties have valid addresses
  - Verify MapBox token is configured
  - Check browser console for geocoding errors
  - Some properties may need manual coordinate entry

**Problem: Analysis calculations seem incorrect**
- **Solution**:
  - Verify all required form fields are filled
  - Check that numeric values are entered correctly
  - Review input values for typos
  - Ensure backend is running and responding

**Problem: Reports not generating**
- **Solution**:
  - Verify backend is running
  - Check browser console for API errors
  - Ensure property analysis has been completed
  - Try refreshing the page

---

## 9. FAQ

### General Questions

**Q: Is the application free to use?**
A: The application itself is open source. However, the external APIs have free tiers with usage limits:
- Zillow API: ~100 requests/month (free tier)
- Google API 31: ~100 requests/month (free tier)
- MapBox: 50,000 map loads/month (free tier)
- For heavy use, paid plans may be required.

**Q: Can I use this for commercial purposes?**
A: Please check the API provider terms of service. Zillow API has specific restrictions on commercial use.

**Q: Does the application store my data?**
A: Currently, property data is stored locally in your browser using localStorage. No data is sent to external servers beyond the API calls for property search and analysis.

**Q: Can I run this without internet?**
A: No, the application requires internet connectivity to:
- Access property data from Zillow API
- Load MapBox maps
- Authenticate with Google OAuth
- Perform geocoding

### Technical Questions

**Q: Which browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (latest versions). Internet Explorer is not supported.

**Q: Can I run this on a server?**
A: Yes, both frontend and backend can be deployed to cloud services. See the Developer Guide for deployment instructions.

**Q: How accurate is the investment analysis?**
A: The calculations are based on industry-standard formulas. However, actual results may vary based on:
- Market conditions
- Property-specific factors
- Local regulations
- Other variables

**Q: Why is the map not showing?**
A: Common causes:
- MapBox token not configured in `.env` file
- Token has expired or been revoked
- Browser blocking MapBox API calls
- Network connectivity issues

### API Questions

**Q: Why am I getting API errors?**
A: Common causes:
- Invalid or expired API key
- API rate limit exceeded
- Network connectivity issues
- Backend server not running

**Q: What's the API rate limit?**
A: Free tier limits vary by provider:
- Zillow API: ~100 requests/month
- Google API 31: ~100 requests/month
- MapBox: 50,000 map loads/month

**Q: Can I use my own API keys?**
A: Yes, you can use your own API keys by:
- Backend: Setting `RAPIDAPI_KEY` environment variable
- Frontend: Adding keys to `.env` file

**Q: Why does the frontend use MapBox instead of Google Maps?**
A: The frontend uses MapBox for map visualization because:
- MapBox provides better customization options
- More generous free tier for map loads
- Better integration with React
- The backend still uses Google API 31 for geocoding services (not used by frontend)

### Setup Questions

**Q: Do I need to install both backend and frontend?**
A: Yes, both components are required:
- Backend provides property data and calculations
- Frontend provides the user interface
- They communicate via REST API

**Q: Can I run only the frontend?**
A: The frontend can start without the backend, but most features will not work:
- Property search will fail
- Analysis calculations will fail
- Map may still work if MapBox is configured

**Q: How do I update the application?**
A: To update:
1. Pull latest changes: `git pull`
2. Backend: `cd googlemapv2 && mvn clean install`
3. Frontend: `cd real-time-real-estate-analyzer/real-time-analyzer && npm install`
4. Restart both services

---

## Help and Support

- **GitHub Issues**: [Report Issues](https://github.com/praneeth-vadrevu/Real-Time-Real-Estate-Investment-Analysis--Web-App/issues)
- **Developer Guide**: See `BACKEND_DEVELOPER_GUIDE.md` for technical details
- **Backend User Guide**: See `BACKEND_USER_GUIDE.md` for backend-specific information

---

*Last Updated: December 2025*
