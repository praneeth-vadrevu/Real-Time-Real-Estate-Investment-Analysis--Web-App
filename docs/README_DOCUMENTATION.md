# Documentation Access Guide

This directory contains the project documentation, including automatically generated code documentation.

## Viewing Doxygen Documentation

The Doxygen-generated code documentation is located in the `html/` subdirectory.

### Quick Access

**After cloning the repository**, simply open the following file in your web browser:

```
docs/html/index.html
```

### Methods to Open

**macOS:**
```bash
open docs/html/index.html
```

**Windows:**
```bash
start docs/html/index.html
```

**Linux:**
```bash
xdg-open docs/html/index.html
```

**Or manually:**
- Navigate to the `docs/html/` folder
- Double-click `index.html`
- Or right-click and select "Open with" → your preferred browser

## Regenerating Documentation

If you want to regenerate the documentation yourself (e.g., after making code changes):

1. **Install Doxygen** (if not already installed):
   - macOS: `brew install doxygen`
   - Windows: Download from [doxygen.nl](https://www.doxygen.nl/download.html)
   - Linux: `sudo apt-get install doxygen` (Ubuntu/Debian)

2. **Generate documentation:**
   ```bash
   cd <project-root>
   doxygen Doxyfile
   ```

3. **View the updated documentation:**
   ```bash
   open docs/html/index.html
   ```

## Documentation Contents

The Doxygen documentation includes:

- **Main Page**: Comprehensive project overview and architecture
- **Classes**: All documented Java classes and TypeScript/React components
- **Files**: Source file listings organized by directory
- **Namespaces**: Java package organization
- **Search**: Full-text search across all documentation

## Other Documentation Files

This `docs/` directory also contains:

- `USER_GUIDE.md` - Complete user guide for setup and usage
- `BACKEND_DEVELOPER_GUIDE.md` - Backend development guide
- `FRONTEND_DEVELOPER_GUIDE.md` - Frontend development guide
- `BACKEND_USER_GUIDE.md` - Backend-specific user guide
- `FRONTEND_USER_GUIDE.md` - Frontend-specific user guide
- `FINANCING_FIELDS_ANALYSIS.md` - Analysis of financing field requirements
- `APPLICATION_WORKFLOW.md` - Application workflow documentation

## Notes

- The generated HTML documentation is included in the repository for easy access
- No additional setup or tools are required to view the documentation
- The documentation is generated from source code comments using Doxygen
- For the most up-to-date information, refer to the source code files directly
