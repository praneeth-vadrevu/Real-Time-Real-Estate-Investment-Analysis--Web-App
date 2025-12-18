@echo off
REM ============================================================
REM Documentation Generator Script
REM Real-Time Real Estate Investment Analysis Web Application
REM ============================================================

echo ============================================================
echo   Documentation Generator
echo   Real-Time Real Estate Investment Analysis
echo ============================================================
echo.

REM Create docs directory if it doesn't exist
if not exist "docs" mkdir docs

REM Step 1: Generate Doxygen HTML documentation
echo [1/3] Generating Doxygen API documentation...
where doxygen >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    doxygen Doxyfile
    if %ERRORLEVEL% EQU 0 (
        echo       [SUCCESS] Doxygen documentation generated in docs/html/
    ) else (
        echo       [WARNING] Doxygen encountered errors
    )
) else (
    echo       [SKIPPED] Doxygen not found. Install with: winget install doxygen
)
echo.

REM Step 2: Generate HTML version from Markdown
echo [2/3] Generating HTML documentation...
where pandoc >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    pandoc README.md USER_GUIDE.md DEVELOPER_GUIDE.md ^
        -o docs/Full_Documentation.html ^
        -s --toc --toc-depth=3 ^
        --metadata title="Real-Time Real Estate Investment Analysis - Complete Documentation" ^
        --css=https://cdn.jsdelivr.net/npm/water.css@2/out/water.css
    if %ERRORLEVEL% EQU 0 (
        echo       [SUCCESS] HTML documentation generated: docs/Full_Documentation.html
    ) else (
        echo       [WARNING] Pandoc HTML generation failed
    )
) else (
    echo       [SKIPPED] Pandoc not found. Install with: winget install pandoc
)
echo.

REM Step 3: Generate PDF version from Markdown
echo [3/3] Generating PDF documentation...
where pandoc >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    REM Remove shield badges and mermaid diagrams for PDF
    powershell -Command "$content = Get-Content README.md, USER_GUIDE.md, DEVELOPER_GUIDE.md -Raw; $content = $content -replace '\[!\[.*?\]\(https://img\.shields\.io/.*?\)\]\(.*?\)\s*', ''; $content = $content -replace '!\[.*?\]\(https://img\.shields\.io/.*?\)', ''; $content = $content -replace '(?ms)```mermaid.+?```', '*[See diagram in HTML version]*'; $content | Out-File -FilePath 'docs/temp_combined.md' -Encoding UTF8"
    
    pandoc docs/temp_combined.md ^
        -o docs/Full_Documentation.pdf ^
        --toc --toc-depth=3 ^
        -V geometry:margin=1in ^
        -V fontsize=11pt ^
        --pdf-engine=xelatex ^
        --metadata title="Real-Time Real Estate Investment Analysis"
    
    if %ERRORLEVEL% EQU 0 (
        echo       [SUCCESS] PDF documentation generated: docs/Full_Documentation.pdf
        del docs\temp_combined.md 2>nul
    ) else (
        echo       [WARNING] PDF generation failed. Ensure MiKTeX is installed.
        del docs\temp_combined.md 2>nul
    )
) else (
    echo       [SKIPPED] Pandoc not found
)
echo.

REM Summary
echo ============================================================
echo   Documentation Generation Complete!
echo ============================================================
echo.
echo Generated files:
if exist "docs\html\index.html" echo   - docs/html/index.html (API Reference)
if exist "docs\Full_Documentation.html" echo   - docs/Full_Documentation.html (HTML Manual)
if exist "docs\Full_Documentation.pdf" echo   - docs/Full_Documentation.pdf (PDF Manual)
echo.
echo Source documentation files:
echo   - README.md (Project Overview)
echo   - USER_GUIDE.md (Installation and Usage)
echo   - DEVELOPER_GUIDE.md (Technical Documentation)
echo.
pause
