# googlemapv2 Folder Structure Explanation

## Overview

The `googlemapv2` folder is your **Spring Boot Backend Server**. Despite the name, it's not just for Google Maps - it's the main backend that handles:
- Property search via Zillow API
- Cashflow calculations
- Geocoding services (Google API 31)
- REST API endpoints for the frontend

---

## Folder Contents Breakdown

### ✅ **KEEP - Essential Source Code**

#### `src/main/java/` (Source Code)
- **Location**: `src/main/java/com/example/map/`
- **Contains**: Your Java source files
- **Files**:
  - `Application.java` - Main Spring Boot entry point (REQUIRED)
  - `geo/GeoController.java` - REST endpoints for geocoding (USED)
  - `geo/GoogleApi31Service.java` - Google API service (USED)
  - Other controllers/services for properties and cashflow
- **Action**: ✅ **KEEP** - This is your actual code

#### `src/main/resources/application.yml`
- **Purpose**: Configuration file for Spring Boot
- **Contains**: Server port, API keys, endpoint URLs
- **Action**: ✅ **KEEP** - Required for backend to run

#### `pom.xml`
- **Purpose**: Maven build configuration
- **Contains**: Dependencies, build settings
- **Action**: ✅ **KEEP** - Required to build/run the project

#### `build.gradle`
- **Purpose**: Gradle build configuration (alternative to Maven)
- **Note**: You have both Maven and Gradle configs - you only need one
- **Action**: ⚠️ **DECIDE** - Keep if using Gradle, remove if using Maven only

---

### ✅ **KEEP - Documentation & Scripts**

#### `README.md`
- **Purpose**: Backend documentation
- **Action**: ✅ **KEEP** - Important documentation

#### `USER_GUIDE.md` & `DEVELOPER_GUIDE.md`
- **Purpose**: User and developer documentation
- **Action**: ✅ **KEEP** - Documentation files

#### `start-backend.sh` & `start-backend.bat`
- **Purpose**: Scripts to start the backend server
- **Action**: ✅ **KEEP** - Useful for running the server

#### `kill-port-8080.sh`
- **Purpose**: Utility to kill processes on port 8080
- **Action**: ✅ **KEEP** - Helpful troubleshooting tool

#### `test-requests.http`
- **Purpose**: HTTP request examples for testing APIs
- **Action**: ✅ **KEEP** - Useful for testing

---

### ⚠️ **OPTIONAL - Build Tools**

#### `gradle/` folder
- **Contains**: Gradle wrapper files
- **Purpose**: Allows running Gradle without installing it
- **Action**: ⚠️ **DECIDE** - Keep if using Gradle, remove if using Maven only

#### `gradlew` & `gradlew.bat`
- **Purpose**: Gradle wrapper executables
- **Action**: ⚠️ **DECIDE** - Keep if using Gradle, remove if using Maven only

#### `settings.gradle`
- **Purpose**: Gradle project settings
- **Action**: ⚠️ **DECIDE** - Keep if using Gradle, remove if using Maven only

---

### ❌ **DELETE - Generated/Build Artifacts**

#### `.gradle/` folder
- **Purpose**: Gradle build cache and temporary files
- **Contains**: Build artifacts, checksums, execution history
- **Action**: ❌ **DELETE** - Can be regenerated, takes up space
- **Note**: Add to `.gitignore` if not already

#### `target/` folder
- **Purpose**: Maven build output
- **Contains**: Compiled classes, generated files
- **Action**: ❌ **DELETE** - Can be regenerated with `mvn clean install`
- **Note**: Add to `.gitignore` if not already

#### `backend.log`
- **Purpose**: Application log file
- **Action**: ❌ **DELETE** - Log file, can be regenerated
- **Note**: Add to `.gitignore` if not already

---

### ⚠️ **DECIDE - Duplicate/Unused Files**

#### `GoogleApi31Service.java` (in root)
- **Location**: Root of `googlemapv2/` folder
- **Note**: This appears to be a duplicate - the real file is in `src/main/java/`
- **Action**: ⚠️ **CHECK & DELETE** - Likely a duplicate, verify then remove

#### `compile.bat` & `test-compile.bat`
- **Purpose**: Windows batch scripts for compilation
- **Action**: ⚠️ **OPTIONAL** - Keep if you use them, remove if not

#### `docs/` folder (inside googlemapv2)
- **Purpose**: Generated documentation (129 files)
- **Action**: ⚠️ **DECIDE** - Can be regenerated, but might be useful
- **Note**: Similar to main `docs/html/` folder

#### `Doxyfile` (inside googlemapv2)
- **Purpose**: Doxygen configuration for backend docs
- **Action**: ⚠️ **DECIDE** - Keep if you want separate backend docs, remove if using main Doxyfile

#### `generate-docs.bat` & `generate-docs.sh` (inside googlemapv2)
- **Purpose**: Scripts to generate documentation
- **Action**: ⚠️ **OPTIONAL** - Keep if useful, remove if using main project scripts

---

## Summary Recommendations

### ✅ **MUST KEEP**
```
googlemapv2/
├── src/                    # Source code (REQUIRED)
├── pom.xml                 # Maven config (REQUIRED)
├── application.yml         # Config (REQUIRED)
├── README.md              # Documentation
├── start-backend.sh       # Startup script
├── start-backend.bat      # Startup script
└── kill-port-8080.sh      # Utility script
```

### ⚠️ **CHOOSE ONE: Maven OR Gradle**
- If using **Maven**: Keep `pom.xml`, delete `build.gradle`, `gradle/`, `gradlew*`, `settings.gradle`
- If using **Gradle**: Keep Gradle files, delete `pom.xml`

### ❌ **SAFE TO DELETE**
```
googlemapv2/
├── .gradle/               # Build cache (regenerates)
├── target/                # Build output (regenerates)
├── backend.log           # Log file (regenerates)
└── GoogleApi31Service.java (if duplicate in root)
```

### ⚠️ **OPTIONAL - Your Choice**
```
googlemapv2/
├── docs/                  # Generated docs (can regenerate)
├── Doxyfile              # Backend-specific Doxygen config
├── generate-docs.*        # Documentation scripts
├── compile.bat           # Compilation scripts
└── test-compile.bat      # Test scripts
```

---

## Quick Cleanup Commands

### Delete build artifacts:
```bash
cd googlemapv2
rm -rf .gradle target backend.log
```

### Delete if using Maven only:
```bash
rm -rf gradle/ gradlew gradlew.bat settings.gradle build.gradle
```

### Delete duplicate file (verify first):
```bash
# Check if it's a duplicate
diff GoogleApi31Service.java src/main/java/com/example/map/geo/GoogleApi31Service.java
# If same, delete the root one
rm GoogleApi31Service.java
```

---

## What the Backend Does

The `googlemapv2` backend provides these REST API endpoints:

1. **Property Search**: `GET /api/properties/search` - Searches Zillow for properties
2. **Property Details**: `GET /api/properties/{zpid}` - Gets property details
3. **Cashflow Analysis**: `POST /api/analysis/cashflow` - Calculates investment metrics
4. **Geo Search**: `GET /api/geo/text` - Text-based location search
5. **Geo Circle**: `GET /api/geo/circle` - Radius-based location search

**Note**: The frontend uses Mapbox directly for maps, but the backend's geo endpoints are available for future use.

---

## Size Impact

- `.gradle/` folder: Can be several MB
- `target/` folder: Can be several MB
- `docs/` folder: Can be several MB
- Total cleanup: Could free up 10-50 MB or more

---

## Recommendation

1. **Delete**: `.gradle/`, `target/`, `backend.log`
2. **Choose**: Keep either Maven OR Gradle (not both)
3. **Check**: Verify if `GoogleApi31Service.java` in root is duplicate
4. **Optional**: Keep `docs/` if you want backend-specific documentation, or delete if using main project docs
