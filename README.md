# Zillow API Java Client

A Java-based Zillow API client that can query property information, price history, images, and other real estate data.

## Requirements

### 1. Install Java Development Environment

**Option A: Using Oracle JDK**
1. Visit [Oracle JDK Download Page](https://www.oracle.com/java/technologies/downloads/)
2. Download JDK 11 or higher for Windows
3. Install and configure environment variables

**Option B: Using OpenJDK (Recommended)**
1. Visit [Adoptium](https://adoptium.net/)
2. Download OpenJDK 11 or higher for Windows
3. Install and configure environment variables

**Option C: Using Package Manager**
```powershell
# Using Chocolatey
choco install openjdk11

# Or using Scoop
scoop install openjdk11
```

### 2. Install Maven (Optional)

**Option A: Manual Installation**
1. Visit [Maven Download Page](https://maven.apache.org/download.cgi)
2. Download Binary zip archive
3. Extract to appropriate location (e.g., C:\Program Files\Apache\maven)
4. Configure environment variables

**Option B: Using Package Manager**
```powershell
# Using Chocolatey
choco install maven

# Or using Scoop
scoop install maven
```

## Project Structure

```
zillow-api/
├── pom.xml                 # Maven configuration file
├── API.java                # Enhanced Zillow API client
├── ZillowMiniApp.java      # Main application
├── PropertyVisualizer.java # Data visualization tool
├── JsonSchemaProbe.java    # JSON schema analysis tool
├── lib/                    # Dependencies directory
└── README.md              # Documentation
```

## Running the Application

### Method 1: Using Maven (Recommended)

```bash
# Compile the project
mvn clean compile

# Run the main program
mvn exec:java -Dexec.mainClass="ZillowMiniApp"

# Run the visualizer
mvn exec:java -Dexec.mainClass="PropertyVisualizer"

# Run JSON schema probe
mvn exec:java -Dexec.mainClass="JsonSchemaProbe" -Dexec.args="your-file.json"
```

### Method 2: Manual Compilation and Execution

```bash
# 1. Download Jackson dependencies
# From https://mvnrepository.com/artifact/com.fasterxml.jackson.core/jackson-databind/2.17.1
# Download jackson-databind-2.17.1.jar, jackson-core-2.17.1.jar, jackson-annotations-2.17.1.jar

# 2. Compile Java files
javac -cp "lib\jackson-databind-2.17.1.jar;lib\jackson-core-2.17.1.jar;lib\jackson-annotations-2.17.1.jar" *.java

# 3. Run the program
java -cp ".;lib\jackson-databind-2.17.1.jar;lib\jackson-core-2.17.1.jar;lib\jackson-annotations-2.17.1.jar" ZillowMiniApp

# 4. Run the visualizer
java -cp ".;lib\jackson-databind-2.17.1.jar;lib\jackson-core-2.17.1.jar;lib\jackson-annotations-2.17.1.jar" PropertyVisualizer
```

### Method 3: Using Batch Script (Windows)

```cmd
# Run the interactive script
run-with-new-api.bat
```

## API Features

### Enhanced API Client provides the following methods:

1. **propertyExtendedSearch(location, status, page)** - Extended property search
2. **propertyDetail(zpid)** - Get detailed property information
3. **images(zpid)** - Get property images
4. **priceAndTaxHistory(zpid)** - Get price and tax history
5. **zestimate(zpid)** - Get Zillow estimate
6. **rentEstimate(zpid)** - Get rent estimate
7. **propertyComps(zpid, count)** - Get comparable properties
8. **walkAndTransitScore(lat, lon)** - Get walkability and transit scores
9. **valueHistoryLocalRentalRates(lat, lon)** - Get local rental rate trends
10. **valueHistoryLocalHomeValue(lat, lon)** - Get local home value trends
11. **monthlyInventory(postalCode, page)** - Get monthly inventory data
12. **property3dTour(zpid)** - Get 3D tour URLs
13. **propertyFloorPlan(zpid)** - Get floor plan URLs

### Data Models

- **SearchCard** - Normalized search result data
- **PropertyDetailMin** - Standardized property details
- **EnrichedProperty** - Enhanced property data with additional information
- **MonthlyInventoryRecord** - Monthly market inventory data

### Environment Variables

Set the following environment variables before running:

```bash
# Set RapidAPI key (optional, code has default test key)
set RAPIDAPI_KEY=your_rapidapi_key_here

# Set demo location (optional, defaults to Santa Monica, CA)
set DEMO_LOCATION=New York, NY
```

## Usage Examples

The program will:
1. Search for properties in the specified location (default: Santa Monica, CA)
2. Get detailed information for the first property
3. Query tax history, images, estimates, and rent information
4. Save all results to JSON files in the output directory
5. Display results in the console

## Features

- **Comprehensive Data Collection**: Search results, property details, tax history, images, estimates
- **Data Visualization**: GUI tool for viewing and analyzing property data
- **JSON Export**: All data saved in structured JSON format
- **Error Handling**: Robust error handling with fallback mechanisms
- **Multiple Data Sources**: Support for various Zillow API endpoints
- **Data Normalization**: Standardized data models for consistent processing

## Output Files

The program generates the following files in the `output` directory:
- `search_*.json` - Search results
- `enhanced_search_cards.json` - Normalized search card data
- `detail_*.json` - Property details
- `enriched_property_*.json` - Enhanced property data
- `tax_*.json` - Tax history
- `images_*.json` - Property images
- `zestimate_*.json` - Zillow estimates
- `rent_*.json` - Rent estimates
- `comps_*.json` - Comparable properties
- `combined_*.json` - Combined data files

## Notes

- The code includes a test API key for demonstration purposes only
- For production use, please use your own RapidAPI key
- Ensure stable internet connection as API calls require external service access
- Some API calls may require paid subscription
- Rate limits may apply based on your API plan

## Troubleshooting

1. **"java is not recognized as an internal or external command"** - Install Java and configure environment variables
2. **"mvn is not recognized as an internal or external command"** - Install Maven or use manual compilation method
3. **API call failures** - Check network connection and API key
4. **Compilation errors** - Ensure Java version is 11 or higher and classpath is configured correctly
5. **Rate limit exceeded** - Wait a moment before making more API calls or upgrade your API plan

## License

This project is for educational and demonstration purposes. Please respect Zillow's API terms of service.