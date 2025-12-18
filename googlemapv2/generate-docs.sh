#!/bin/bash
# ============================================================
# Documentation Generation Script for Real Estate Backend
# ============================================================
# This script generates:
#   1. Doxygen API documentation (HTML)
#   2. Pandoc PDF documentation (optional)
# ============================================================

echo ""
echo "============================================================"
echo "  Real Estate Backend - Documentation Generator"
echo "============================================================"
echo ""

# Check for Doxygen
if ! command -v doxygen &> /dev/null; then
    echo "[WARNING] Doxygen not found. Skipping API documentation."
    echo "To install:"
    echo "  macOS: brew install doxygen"
    echo "  Linux: sudo apt install doxygen"
    echo ""
else
    echo "[1/2] Generating Doxygen API documentation..."
    doxygen Doxyfile
    if [ $? -eq 0 ]; then
        echo "[SUCCESS] API documentation generated in docs/html/"
        echo "Open docs/html/index.html to view"
    else
        echo "[ERROR] Doxygen generation failed"
    fi
    echo ""
fi

# Check for Pandoc
if ! command -v pandoc &> /dev/null; then
    echo "[WARNING] Pandoc not found. Skipping PDF generation."
    echo "To install:"
    echo "  macOS: brew install pandoc"
    echo "  Linux: sudo apt install pandoc"
    echo ""
else
    echo "[2/2] Generating PDF documentation..."
    mkdir -p docs
    
    # Generate combined PDF from all markdown files
    pandoc README.md USER_GUIDE.md DEVELOPER_GUIDE.md \
        -o docs/Backend_Documentation.pdf \
        --toc \
        --toc-depth=3 \
        -V geometry:margin=1in \
        -V fontsize=11pt \
        -V documentclass=report \
        --highlight-style=tango \
        -V colorlinks=true \
        -V linkcolor=blue \
        -V toccolor=blue \
        --metadata title="Real Estate Backend Service Documentation" \
        --metadata author="CS 682 Team" \
        --metadata date="December 2025"
    
    if [ $? -eq 0 ]; then
        echo "[SUCCESS] PDF documentation generated: docs/Backend_Documentation.pdf"
    else
        echo "[WARNING] PDF generation failed. LaTeX may be required."
        echo "To install LaTeX:"
        echo "  macOS: brew install --cask mactex"
        echo "  Linux: sudo apt install texlive-latex-base"
        echo ""
        echo "Trying HTML output instead..."
        
        pandoc README.md USER_GUIDE.md DEVELOPER_GUIDE.md \
            -o docs/Backend_Documentation.html \
            --toc \
            --toc-depth=3 \
            --standalone \
            --metadata title="Real Estate Backend Service Documentation"
        
        if [ $? -eq 0 ]; then
            echo "[SUCCESS] HTML documentation generated: docs/Backend_Documentation.html"
        fi
    fi
fi

echo ""
echo "============================================================"
echo "  Documentation Generation Complete"
echo "============================================================"
echo ""
echo "Generated files:"
[ -f "docs/html/index.html" ] && echo "  - docs/html/index.html (Doxygen API Reference)"
[ -f "docs/Backend_Documentation.pdf" ] && echo "  - docs/Backend_Documentation.pdf (Full Manual)"
[ -f "docs/Backend_Documentation.html" ] && echo "  - docs/Backend_Documentation.html (Full Manual)"
echo ""
