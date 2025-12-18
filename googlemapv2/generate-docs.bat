@echo off
REM ============================================================
REM Documentation Generation Script for Real Estate Backend
REM ============================================================
REM This script generates:
REM   1. Doxygen API documentation (HTML)
REM   2. Pandoc PDF documentation (optional)
REM ============================================================

echo.
echo ============================================================
echo   Real Estate Backend - Documentation Generator
echo ============================================================
echo.

REM Check for Doxygen
where doxygen >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Doxygen not found. Skipping API documentation.
    echo To install: choco install doxygen.install
    echo.
    goto :pandoc
)

echo [1/2] Generating Doxygen API documentation...
doxygen Doxyfile
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] API documentation generated in docs/html/
    echo Open docs/html/index.html to view
) else (
    echo [ERROR] Doxygen generation failed
)
echo.

:pandoc
REM Check for Pandoc
where pandoc >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Pandoc not found. Skipping PDF generation.
    echo To install: choco install pandoc
    echo.
    goto :end
)

echo [2/2] Generating PDF documentation...
if not exist "docs" mkdir docs

REM Generate combined PDF from all markdown files
pandoc README.md USER_GUIDE.md DEVELOPER_GUIDE.md ^
    -o docs/Backend_Documentation.pdf ^
    --toc ^
    --toc-depth=3 ^
    -V geometry:margin=1in ^
    -V fontsize=11pt ^
    -V documentclass=report ^
    --highlight-style=tango ^
    -V colorlinks=true ^
    -V linkcolor=blue ^
    -V toccolor=blue ^
    --metadata title="Real Estate Backend Service Documentation" ^
    --metadata author="CS 682 Team" ^
    --metadata date="December 2025"

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] PDF documentation generated: docs/Backend_Documentation.pdf
) else (
    echo [WARNING] PDF generation failed. LaTeX may be required.
    echo To install LaTeX: choco install miktex
    echo.
    echo Trying HTML output instead...
    pandoc README.md USER_GUIDE.md DEVELOPER_GUIDE.md ^
        -o docs/Backend_Documentation.html ^
        --toc ^
        --toc-depth=3 ^
        --standalone ^
        --metadata title="Real Estate Backend Service Documentation"
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] HTML documentation generated: docs/Backend_Documentation.html
    )
)

:end
echo.
echo ============================================================
echo   Documentation Generation Complete
echo ============================================================
echo.
echo Generated files:
if exist "docs\html\index.html" echo   - docs/html/index.html (Doxygen API Reference)
if exist "docs\Backend_Documentation.pdf" echo   - docs/Backend_Documentation.pdf (Full Manual)
if exist "docs\Backend_Documentation.html" echo   - docs/Backend_Documentation.html (Full Manual)
echo.
pause
