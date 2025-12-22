# User Guide - Real Estate Backend Service

> **Version:** 1.0.0  
> **Last Updated:** December 2025  
> **Audience:** End Users, System Administrators

---

## Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [Installation Guide](#3-installation-guide)
4. [Configuration](#4-configuration)
5. [Starting the Server](#5-starting-the-server)
6. [Using the API](#6-using-the-api)
7. [Troubleshooting](#7-troubleshooting)
8. [FAQ](#8-faq)

---

## 1. Introduction

### What is this application?

The Real Estate Backend Service is a REST API server for the Real-Time Real Estate Investment Analysis app:

- Property search via Zillow
- Address geocoding and nearby place search
- ROI and cashflow calculations

### Who should use this guide?

- **System Administrators** setting up the backend server
- **Developers** integrating with the API
- **End Users** running the application locally

---

## 2. System Requirements

### Minimum Requirements

- Windows 10/11, macOS 10.15+, or Linux (Ubuntu 20.04+)
- JDK 17 or higher
- 4 GB RAM minimum
- 500 MB free disk space
- Internet connection for API calls

### Required Accounts

- RapidAPI account for Zillow & Google API access: [Sign Up](https://rapidapi.com/)

---

## 3. Installation Guide

### Step 1: Install Java 17

#### Windows
1. Download Java 17 from [Adoptium](https://adoptium.net/)
2. Run the installer
3. Verify installation:
   ```powershell
   java -version
   ```
   Expected output: `openjdk version "17.x.x"`

#### macOS
```bash
# Using Homebrew
brew install openjdk@17

# Add to PATH
echo 'export PATH="/opt/homebrew/opt/openjdk@17/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
java -version
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install openjdk-17-jdk

# Verify
java -version
```

### Step 2: Install Maven

#### Windows
1. Download Maven from [Apache Maven](https://maven.apache.org/download.cgi)
2. Extract to `C:\Program Files\Apache\maven`
3. Add to System PATH:
   - Open System Properties → Environment Variables
   - Add `C:\Program Files\Apache\maven\bin` to PATH
4. Verify:
   ```powershell
   mvn -version
   ```

#### macOS/Linux
```bash
# macOS
brew install maven

# Linux
sudo apt install maven

# Verify
mvn -version
```

### Step 3: Get RapidAPI Key

1. Go to [RapidAPI](https://rapidapi.com/)
2. Create an account or sign in
3. Subscribe to these APIs:
   - [Zillow API](https://rapidapi.com/apimaker/api/zillow-com1)
   - [Google API 31](https://rapidapi.com/rphrp1985/api/google-api31)
4. Copy your API key from the dashboard

### Step 4: Download the Project

```bash
# Clone the repository
git clone https://github.com/praneeth-vadrevu/Real-Time-Real-Estate-Investment-Analysis--Web-App.git

# Navigate to backend directory
cd Real-Time-Real-Estate-Investment-Analysis--Web-App/googlemapv2
```

---

## 4. Configuration

### Setting Up Environment Variables

#### Windows (PowerShell)
```powershell
# Temporary (current session only)
$env:RAPIDAPI_KEY = "your-api-key-here"

# Permanent
[Environment]::SetEnvironmentVariable("RAPIDAPI_KEY", "your-api-key-here", "User")
```

#### Windows (Command Prompt)
```cmd
set RAPIDAPI_KEY=your-api-key-here
```

#### macOS/Linux
```bash
# Temporary
export RAPIDAPI_KEY="your-api-key-here"

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export RAPIDAPI_KEY="your-api-key-here"' >> ~/.bashrc
source ~/.bashrc
```

### Configuration File

The main configuration file is located at `src/main/resources/application.yml`:

```yaml
server:
  port: 8080                    # Server port (change if needed)

zillow:
  rapidapi:
    host: zillow-com1.p.rapidapi.com
    key: ${RAPIDAPI_KEY}        # Uses environment variable

googleapi31:
  rapidapi:
    host: google-api31.p.rapidapi.com
    key: ${RAPIDAPI_KEY}
  endpoint: https://google-api31.p.rapidapi.com/map
```

### Changing the Server Port

If port 8080 is in use, modify `application.yml`:

```yaml
server:
  port: 8081  # or any available port
```

---

## 5. Starting the Server

### Method 1: Using Maven (Recommended)

```bash
# Navigate to the backend directory
cd googlemapv2

# Build and run
mvn spring-boot:run
```

### Method 2: Using Batch Scripts (Windows)

```batch
# First time: compile the project
compile.bat

# Start the server
start-backend.bat
```

### Method 3: Using JAR File

```bash
# Build the JAR
mvn clean package

# Run the JAR
java -jar target/googlemapv2-1.0.0.jar
```

### Verifying the Server is Running

1. **Check the console output:**
   ```
   Started Application in X.XXX seconds (process running for X.XXX)
   ```

2. **Test the API:**
   ```bash
   curl http://localhost:8080/api/geo/text?text=test
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8080/api/geo/text?text=test`

---

## 6. Using the API

### Property Search

Search for properties in a specific location:

```bash
# Search for homes for sale in Santa Monica
curl "http://localhost:8080/api/properties/search?location=Santa%20Monica,%20CA&status=for_sale"
```

**Parameters:**
- `location` (required): City, state, or ZIP code
- `status` (optional): `for_sale`, `for_rent`, or `sold`
- `page` (optional): Page number for pagination

### Get Property Details

Get detailed information about a specific property:

```bash
# Get property by Zillow Property ID (ZPID)
curl "http://localhost:8080/api/properties/20479916"
```

### Investment Cashflow Analysis

Analyze the investment potential of a property:

```bash
curl -X POST "http://localhost:8080/api/analysis/cashflow" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

### Geolocation Search

Search for places by text:

```bash
curl "http://localhost:8080/api/geo/text?text=coffee&city=Boston&state=MA"
```

Search within a radius:

```bash
curl "http://localhost:8080/api/geo/circle?lat=34.0195&lon=-118.4912&radius=5000&text=restaurant"
```

---

## 7. Troubleshooting

### Issue: "Port 8080 already in use"

**Solution:**

Windows:
```powershell
# Find the process using port 8080
netstat -ano | findstr :8080

# Kill the process (replace <PID> with actual PID)
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
# Find and kill the process
lsof -i :8080
kill -9 <PID>
```

Or change the port in `application.yml`.

### Issue: "RAPIDAPI_KEY not found"

**Solution:**
1. Verify the environment variable is set:
   ```powershell
   echo $env:RAPIDAPI_KEY  # Windows PowerShell
   echo $RAPIDAPI_KEY      # Linux/macOS
   ```

2. If empty, set it again (see Configuration section)

3. Restart your terminal/IDE after setting

### Issue: "Connection refused" errors

**Solution:**
1. Verify the server is running
2. Check if a firewall is blocking the connection
3. Ensure you're using the correct port

### Issue: "401 Unauthorized" from API

**Solution:**
1. Check if your RapidAPI key is valid
2. Verify you're subscribed to the required APIs
3. Check if you've exceeded API rate limits

### Issue: "CORS error" in browser

**Solution:**
The backend allows CORS from `localhost:3000` by default. If your frontend runs on a different port, update `CorsConfig.java`.

---

## 8. FAQ

### Q: How do I change the server port?

A: Edit `src/main/resources/application.yml` and change `server.port` to your desired port.

### Q: How many API calls can I make?

A: This depends on your RapidAPI subscription plan. Check your RapidAPI dashboard for limits.

### Q: Can I run this on a remote server?

A: Yes! Deploy the JAR file to any server with Java 17 and set the environment variables accordingly.

### Q: How do I update the application?

A: 
```bash
git pull origin main
mvn clean install
mvn spring-boot:run
```

### Q: Is my API key secure?

A: The API key is stored as an environment variable, not in the code. Never commit API keys to version control.

### Q: How do I view server logs?

A: Logs are printed to the console. For file logging, add this to `application.yml`:
```yaml
logging:
  file:
    name: backend.log
```

---

## Getting Help

- **GitHub Issues:** [Report a bug](https://github.com/praneeth-vadrevu/Real-Time-Real-Estate-Investment-Analysis--Web-App/issues)
- **Documentation:** Check the [README.md](README.md) for quick reference

---

## Document History

Version 1.0.0 - December 2025 - Initial release
