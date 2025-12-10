@echo off
echo Starting Backend Server on port 8080...
echo.
cd /d "%~dp0"
mvn spring-boot:run
pause

