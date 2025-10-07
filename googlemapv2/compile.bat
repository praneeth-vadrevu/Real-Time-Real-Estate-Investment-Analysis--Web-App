@echo off
echo Compiling Google Maps API Project...
echo.

REM Check if javac is available
where javac >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: javac not found. Please install JDK 17 or higher.
    exit /b 1
)

REM Create output directory
if not exist "target\classes" mkdir target\classes

REM Download dependencies (Spring Boot, Jackson)
echo Note: This project requires Spring Boot and Jackson dependencies.
echo Please use Maven or Gradle to build the project properly.
echo.
echo Manual compilation requires all dependencies in classpath.
echo.
echo For quick testing, you can:
echo 1. Install Maven: https://maven.apache.org/download.cgi
echo 2. Run: mvn clean package
echo 3. Run: mvn spring-boot:run
echo.
echo Or install Gradle and run:
echo 1. gradle build
echo 2. gradle bootRun
echo.

pause

