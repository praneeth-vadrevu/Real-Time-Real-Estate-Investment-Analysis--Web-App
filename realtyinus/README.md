# RealtyInUS - Real Estate Aggregation Service

## Project Overview

RealtyInUS is a Spring Boot-based real estate data aggregation service that provides property data querying, aggregation, and visualization capabilities.

## Features

- ✅ Real estate data aggregation (RapidAPI integration)
- ✅ Multi-criteria filtering (location, price, property type, etc.)
- ✅ Concurrent data fetching and processing
- ✅ JSON data export
- ✅ HTML visualization report generation
- ✅ Statistical analysis reports

## Project Structure

```
realtyinus/
├── src/
│   ├── main/
│   │   ├── java/com/ireia/realty/
│   │   │   ├── RealtyApplication.java          # Spring Boot main application
│   │   │   ├── api/
│   │   │   │   ├── RapidApiGenericClient.java  # API client
│   │   │   │   └── dto/
│   │   │   │       ├── EnrichedProperty.java   # Property data DTO
│   │   │   │       └── EnrichedListQuery.java  # Query parameters DTO
│   │   │   ├── service/
│   │   │   │   └── RealtyAggregationService.java # Aggregation service
│   │   │   └── web/
│   │   │       └── EnrichedController.java      # REST controller
│   │   └── resources/
│   │       └── application.yml                  # Application configuration
│   └── test/
│       └── java/com/ireia/realty/
│           └── RealtyVisualizerTest.java        # Test and visualization tools
├── output/                                       # Output directory
│   ├── properties_*.json                        # JSON data
│   ├── visualization_*.html                     # HTML visualization
│   └── statistics_report_*.txt                  # Statistics reports
└── pom.xml                                       # Maven configuration
```

## Technology Stack

- Java 17
- Spring Boot 3.2.0
- Apache HttpClient 5
- Jackson (JSON processing)
- Maven

## Quick Start

### 1. Environment Requirements

- Java 17+
- Maven 3.6+

### 2. Compile Project

```bash
cd realtyinus
mvn clean compile
```

### 3. Run Tests and Generate Visualization

```bash
mvn test-compile
mvn exec:java -Dexec.mainClass="com.ireia.realty.RealtyVisualizerTest" -Dexec.classpathScope=test
```

### 4. View Visualization Results

Generated files are located in the `output/` directory:
- `visualization_*.html` - Open in browser to view beautiful property cards
- `properties_*.json` - JSON format property data
- `statistics_report_*.txt` - Detailed statistical analysis reports

## API Endpoints

### 1. Raw List Query
```
POST /api/listings/raw
```

### 2. Enriched Query (includes detailed information)
```
POST /api/listings/enriched
```

## Configuration

Configure in `src/main/resources/application.yml`:

```yaml
server:
  port: 8080

realty:
  rapidapi:
    host: realty-in-us.p.rapidapi.com
    key: ${RAPIDAPI_KEY}  # Inject via environment variable
  aggregation:
    detailTimeoutSec: 20
    perPageEnrichLimit: 20
```

## Query Parameters Example

```json
{
  "offset": 0,
  "limit": 10,
  "city": "Boston",
  "state_code": "MA",
  "status": ["for_sale"],
  "price_min": 300000,
  "price_max": 1000000,
  "beds_min": 2,
  "baths_min": 1.5,
  "prop_type": ["single_family", "condo"],
  "sort_field": "list_date",
  "sort_dir": "desc",
  "includeDetail": true,
  "includePhotos": true
}
```

## Visualization Output Example

The test tool generates visualization reports containing:

### Statistics Overview
- Total number of properties
- Average price
- Average area
- Number of properties for sale

### Property Cards
Each property includes:
- Cover image
- Price
- Address
- Bedrooms/Bathrooms/Area
- Property type and status

### Data Analysis
- Distribution by city
- Distribution by status
- Distribution by type
- Price range analysis

## Test Results Example

```
=== Starting test data and visualization generation ===
JSON data saved: output/properties_20251021_154303.json
HTML visualization generated: output/visualization_20251021_154303.html

[Basic Statistics]
Total properties: 20
Average price: $877,251.85
Minimum price: $427,537
Maximum price: $1,353,607

[Distribution by City]
  Boston: 4 properties
  Cambridge: 4 properties
  Newton: 4 properties
  Brookline: 4 properties
  Somerville: 4 properties
```

## Development Notes

### Adding New Data Sources
Add new API call methods in `RapidApiGenericClient`.

### Extending Aggregation Features
Add new aggregation logic in `RealtyAggregationService`.

### Customizing Visualization
Modify HTML generation logic in `RealtyVisualizerTest`.

## License

MIT License

## Authors

Real-Time Real Estate Investment Analysis Team

