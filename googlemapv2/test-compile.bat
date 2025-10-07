@echo off
echo ========================================
echo Testing Google Maps API v2 Compilation
echo ========================================
echo.

REM Check Maven
echo [1/3] Checking Maven...
where mvn >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Maven not found. Please install Maven first.
    echo Download from: https://maven.apache.org/download.cgi
    pause
    exit /b 1
)
echo ✅ Maven found

REM Check Java
echo.
echo [2/3] Checking Java...
where java >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Java not found. Please install JDK 17 or higher.
    pause
    exit /b 1
)
java -version
echo ✅ Java found

REM Compile project
echo.
echo [3/3] Compiling project...
echo.
call mvn clean compile

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo ✅ Compilation Successful!
    echo ========================================
    echo.
    echo Project is ready to run.
    echo.
    echo To start the application:
    echo   mvn spring-boot:run
    echo.
    echo To run tests:
    echo   mvn test
    echo.
) else (
    echo.
    echo ========================================
    echo ❌ Compilation Failed
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause

