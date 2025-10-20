@echo off
echo Zillow API Java Client Run Script (New API Version)
echo ================================================

REM Check if Java is installed
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Java Runtime Environment not found
    echo Please install Java 11 or higher first
    echo Download from: https://adoptium.net/
    pause
    exit /b 1
)

echo Java environment check passed
java -version

echo.
echo Compiling Java files...
javac -cp "lib\jackson-databind-2.17.1.jar;lib\jackson-core-2.17.1.jar;lib\jackson-annotations-2.17.1.jar" *.java

if %errorlevel% equ 0 (
    echo Compilation successful!
    echo.
    echo Select run mode:
    echo 1. Run main program (generate JSON data)
    echo 2. Run visualizer program
    echo 3. Run API test
    echo 4. Run all
    echo.
    set /p choice="Please select (1-4): "
    
    if "%choice%"=="1" (
        echo Running main program...
        java -cp ".;lib\jackson-databind-2.17.1.jar;lib\jackson-core-2.17.1.jar;lib\jackson-annotations-2.17.1.jar" ZillowMiniApp
    ) else if "%choice%"=="2" (
        echo Running visualizer program...
        java -cp ".;lib\jackson-databind-2.17.1.jar;lib\jackson-core-2.17.1.jar;lib\jackson-annotations-2.17.1.jar" PropertyVisualizer
    ) else if "%choice%"=="3" (
        echo Running API test...
        java -cp ".;lib\jackson-databind-2.17.1.jar;lib\jackson-core-2.17.1.jar;lib\jackson-annotations-2.17.1.jar" API
    ) else if "%choice%"=="4" (
        echo Running main program...
        java -cp ".;lib\jackson-databind-2.17.1.jar;lib\jackson-core-2.17.1.jar;lib\jackson-annotations-2.17.1.jar" ZillowMiniApp
        echo.
        echo Main program completed, now starting visualizer...
        java -cp ".;lib\jackson-databind-2.17.1.jar;lib\jackson-core-2.17.1.jar;lib\jackson-annotations-2.17.1.jar" PropertyVisualizer
    ) else (
        echo Invalid selection, running main program...
        java -cp ".;lib\jackson-databind-2.17.1.jar;lib\jackson-core-2.17.1.jar;lib\jackson-annotations-2.17.1.jar" ZillowMiniApp
    )
) else (
    echo Compilation failed, please check Java version and dependencies
)

echo.
echo Program execution completed
pause