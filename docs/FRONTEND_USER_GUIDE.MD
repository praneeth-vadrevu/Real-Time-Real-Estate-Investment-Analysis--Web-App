# Real-Time Real Estate Investment Analysis - Frontend Application

A comprehensive React-based web application for real estate investment analysis. This frontend provides an intuitive interface for property search, cashflow analysis, investment strategy comparison, and report generation.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Prerequisites](#prerequisites)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Running the Application](#running-the-application)
8. [Project Structure](#project-structure)
9. [Development Guide](#development-guide)
10. [Building for Production](#building-for-production)
11. [Troubleshooting](#troubleshooting)
12. [API Integration](#api-integration)

---

## Overview

This frontend application is part of the Real-Time Real Estate Investment Analysis system. It provides a user-friendly interface for real estate investors to:

- Search and discover properties across the United States
- Analyze investment opportunities using multiple strategies (Rental, BRRRR, Flip, Wholesale)
- Calculate comprehensive cashflow metrics and investment returns
- Compare multiple properties side-by-side
- Generate detailed investment analysis reports
- Visualize properties on interactive maps

The application communicates with a Spring Boot backend service for property data retrieval and financial calculations, while using MapBox for map visualization and Google OAuth for user authentication.

---

## Features

### User Authentication
- Google OAuth integration for secure sign-in
- Guest mode for quick access without authentication
- Session persistence using browser localStorage

### Property Management
- Search properties by location (city, state, ZIP code)
- View property details including price, bedrooms, bathrooms, square footage
- Save properties to personal portfolio
- Organize properties by investment strategy
- Shortlist properties for comparison

### Investment Analysis
- Support for four investment strategies:
  - **Rental**: Long-term buy-and-hold properties
  - **BRRRR**: Buy, Rehab, Rent, Refinance, Repeat
  - **Flip**: Buy, renovate, and sell for profit
  - **Wholesale**: Assign contracts to other investors
- Comprehensive cashflow calculations:
  - Net Operating Income (NOI)
  - Cap Rate (Purchase Price and Fair Market Value)
  - Debt Service Coverage Ratio (DSCR)
  - Cash-on-Cash Return
  - Internal Rate of Return (IRR)
  - Equity Multiple
  - Multi-year cashflow projections

### Visualization
- Interactive MapBox maps with property markers
- Geocoding for address-to-coordinates conversion
- Property popups with key information
- Map-based property search

### Reporting
- Generate detailed HTML investment reports
- Export reports as downloadable HTML files
- Print-friendly report formatting
- Includes all financial metrics and projections

### User Interface
- Responsive design for desktop and mobile
- Intuitive navigation with sidebar and top navbar
- Real-time form validation
- Loading states and error handling
- Property comparison tools

---

## Technology Stack

### Core Framework
- **React 19.2.0**: UI library for building user interfaces
- **TypeScript 4.9.5**: Type-safe JavaScript
- **Create React App 5.0.1**: Build tooling and development environment

### State Management
- **React Context API**: Global state management for authentication and properties
- **React Hooks**: useState, useEffect, useRef for component state

### UI Libraries
- **react-icons 5.5.0**: Icon library
- **react-map-gl 8.1.0**: React wrapper for MapBox GL
- **mapbox-gl 3.16.0**: MapBox GL JavaScript library

### Authentication
- **@react-oauth/google 0.12.2**: Google OAuth integration

### Development Tools
- **TypeScript**: Static type checking
- **ESLint**: Code linting
- **Jest**: Testing framework
- **@testing-library/react**: React component testing utilities

---

## Prerequisites

Before installing and running the frontend application, ensure you have the following installed:

### Required Software

1. **Node.js 18 or higher**
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`
   - Includes npm (Node Package Manager)

2. **npm or yarn**
   - npm comes with Node.js
   - Verify: `npm --version`
   - Alternative: Install yarn globally: `npm install -g yarn`

### Required Accounts and API Keys

1. **MapBox Access Token**
   - Sign up at [mapbox.com](https://www.mapbox.com/)
   - Create an access token from your account dashboard
   - Required for map display and geocoding

2. **Google OAuth Client ID** (Optional)
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add `http://localhost:3000` to authorized JavaScript origins
   - Required for Google sign-in (app works without it in guest mode)

3. **Backend Server**
   - The Spring Boot backend must be running on port 8080
   - See backend documentation for setup instructions

---

## Installation

### Step 1: Navigate to Frontend Directory

```bash
cd real-time-real-estate-analyzer/real-time-analyzer
```

### Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

This will install all required dependencies listed in `package.json`, including React, TypeScript, MapBox libraries, and development tools.

### Step 3: Verify Installation

Check that all dependencies were installed correctly:
```bash
npm list --depth=0
```

You should see all packages listed without errors.

---

## Configuration

### Environment Variables

Create a `.env` file in the `real-time-real-estate-analyzer/real-time-analyzer/` directory with the following variables:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
REACT_APP_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
```

**Important Notes:**
- Environment variables must start with `REACT_APP_` to be accessible in the React app
- Do not use quotes around the values
- Restart the development server after changing environment variables
- Never commit the `.env` file to version control (it should be in `.gitignore`)

### Example .env File

```env
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
REACT_APP_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNscXh4eHh4eHh4eHh4In0.abcdefghijklmnopqrstuvwxyz
```

### Configuration Without Environment Variables

The application will work without these environment variables, but with limited functionality:
- Without Google OAuth: Users can only use guest mode
- Without MapBox token: Maps will not display (error message shown)

---

## Running the Application

### Development Mode

Start the development server:
```bash
npm start
```

The application will:
- Start on `http://localhost:3000`
- Automatically open in your default browser
- Enable hot-reloading (changes reflect immediately)
- Display compilation errors in the browser console

### Development Server Features

- **Hot Module Replacement**: Changes to code automatically refresh the browser
- **Error Overlay**: Compilation errors displayed in browser
- **Source Maps**: Original source code visible in browser DevTools
- **Fast Refresh**: Component state preserved during updates

### Stopping the Server

Press `Ctrl+C` in the terminal to stop the development server.

### Running Tests

Execute the test suite:
```bash
npm test
```

This launches the test runner in interactive watch mode. Tests will re-run when files change.

### Building for Production

Create an optimized production build:
```bash
npm run build
```

This creates a `build/` folder with optimized, minified files ready for deployment.

---

## Project Structure

```
real-time-analyzer/
├── public/                 # Static assets
│   ├── index.html         # HTML template
│   ├── favicon.ico        # Site icon
│   └── manifest.json      # PWA manifest
├── src/
│   ├── components/        # React components
│   │   ├── AuthPage.tsx           # Authentication page
│   │   ├── Dashboard.tsx          # Main dashboard
│   │   ├── Navbar.tsx             # Top navigation
│   │   ├── Sidebar.tsx            # Left sidebar navigation
│   │   ├── SearchPage.tsx         # Property search interface
│   │   ├── PropertyForm.tsx       # Property input and analysis form
│   │   ├── PropertyMap.tsx       # MapBox map component
│   │   ├── PropertyReportViewer.tsx  # Report display and export
│   │   ├── PropertyComparison.tsx    # Property comparison tool
│   │   ├── PurchaseCriteriaForm.tsx   # Investment criteria form
│   │   └── Footer.tsx              # Footer component
│   ├── context/           # React Context providers
│   │   ├── AuthContext.tsx        # Authentication state
│   │   └── PropertiesContext.tsx  # Saved properties state
│   ├── utils/             # Utility functions
│   │   ├── cashflowApi.ts         # Backend API integration
│   │   └── reportGenerator.ts     # Report generation logic
│   ├── App.tsx            # Main application component
│   ├── App.css            # Application styles
│   ├── index.tsx          # Application entry point
│   └── index.css          # Global styles
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── .env                   # Environment variables (create this)
```

### Component Responsibilities

**AuthPage.tsx**
- Handles user authentication (Google OAuth and guest mode)
- Displays login interface
- Manages authentication state

**Dashboard.tsx**
- Main property portfolio view
- Displays saved properties in list and map views
- Property filtering and search
- Property management actions (delete, shortlist)

**SearchPage.tsx**
- Property search interface
- Integrates with backend for property data
- Displays search results in list and map formats
- Property selection and import

**PropertyForm.tsx**
- Comprehensive property data input form
- Supports multiple investment strategies
- Auto-fills data from Zillow API
- Triggers cashflow analysis
- Displays analysis results

**PropertyMap.tsx**
- MapBox map integration
- Property marker display
- Geocoding for addresses
- Interactive map controls

**PropertyReportViewer.tsx**
- Displays generated investment reports
- Provides download and print functionality
- HTML report rendering

**PropertyComparison.tsx**
- Side-by-side property comparison
- Metric comparison tables
- Visual comparison charts

---

## Development Guide

### Adding New Components

1. Create component file in `src/components/`
2. Use TypeScript for type safety
3. Follow existing component patterns
4. Export component as default

Example:
```typescript
import React from 'react';

interface MyComponentProps {
  title: string;
  onAction: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onAction }) => {
  return (
    <div>
      <h1>{title}</h1>
      <button onClick={onAction}>Action</button>
    </div>
  );
};

export default MyComponent;
```

### State Management

The application uses React Context API for global state:

**AuthContext**: Manages user authentication
- `user`: Current user object
- `isAuthenticated`: Boolean authentication status
- `isGuest`: Boolean guest mode status
- `login()`: Sign in function
- `logout()`: Sign out function
- `browseAsGuest()`: Enable guest mode

**PropertiesContext**: Manages saved properties
- `properties`: Array of saved properties
- `addProperty()`: Add new property
- `updateProperty()`: Update existing property
- `deleteProperty()`: Remove property
- `toggleShortlist()`: Toggle shortlist status
- `getPropertiesByStrategy()`: Filter by strategy

### API Integration

The frontend communicates with the backend via REST API:

**Base URL**: `http://localhost:8080`

**Endpoints Used**:
- `GET /api/properties/search?location={location}&status={status}&page={page}` - Property search
- `GET /api/properties/{zpid}` - Property details
- `POST /api/analysis/cashflow` - Cashflow analysis

API calls are handled in `src/utils/cashflowApi.ts`:
- `analyzeCashflow()`: Sends cashflow analysis request
- `mapPropertyDataToCashflowRequest()`: Converts form data to API format

### Styling

The application uses:
- CSS modules for component-specific styles
- Global styles in `App.css` and `index.css`
- Inline styles for dynamic styling
- Responsive design principles

### TypeScript Usage

All components and utilities use TypeScript:
- Define interfaces for props and data structures
- Use type annotations for function parameters and return values
- Leverage TypeScript's type checking during development

---

## Building for Production

### Create Production Build

```bash
npm run build
```

This command:
- Optimizes and minifies JavaScript and CSS
- Creates source maps for debugging
- Generates static assets in the `build/` folder
- Prepares the application for deployment

### Build Output

The `build/` folder contains:
- `index.html`: Main HTML file
- `static/`: JavaScript, CSS, and asset files
- Optimized bundle files with content hashing for caching

### Deploying the Build

The `build/` folder can be deployed to any static hosting service:
- **Netlify**: Drag and drop the build folder
- **Vercel**: Connect repository and deploy
- **GitHub Pages**: Use gh-pages package
- **AWS S3**: Upload build folder contents
- **Apache/Nginx**: Copy build folder to web root

### Environment Variables in Production

For production deployment, set environment variables in your hosting platform:
- Netlify: Site settings > Environment variables
- Vercel: Project settings > Environment variables
- Other platforms: Follow their documentation

---

## Troubleshooting

### Port 3000 Already in Use

**Error**: `Something is already running on port 3000`

**Solution**:
```bash
# Find process using port 3000
lsof -ti:3000

# Kill the process
kill -9 <PID>
```

Or use a different port:
```bash
PORT=3001 npm start
```

### Backend Connection Errors

**Error**: `Backend server is not running`

**Solution**:
1. Ensure backend server is running on port 8080
2. Check backend logs for errors
3. Verify backend is accessible: `curl http://localhost:8080/api/geo/text?text=test`
4. Check CORS configuration in backend

### MapBox Map Not Displaying

**Error**: Map shows error message or blank screen

**Solution**:
1. Verify `REACT_APP_MAPBOX_ACCESS_TOKEN` is set in `.env`
2. Check token is valid in MapBox account
3. Ensure token has correct permissions
4. Restart development server after adding token

### Google OAuth Not Working

**Error**: Google sign-in button doesn't appear or fails

**Solution**:
1. Verify `REACT_APP_GOOGLE_CLIENT_ID` is set in `.env`
2. Check Client ID is correct in Google Cloud Console
3. Ensure `http://localhost:3000` is in authorized JavaScript origins
4. Verify OAuth consent screen is configured
5. Restart development server after changes

### Module Not Found Errors

**Error**: `Cannot find module` or `Module not found`

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

**Error**: TypeScript compilation errors

**Solution**:
1. Check `tsconfig.json` configuration
2. Verify all imports are correct
3. Ensure type definitions are installed: `npm install --save-dev @types/[package-name]`
4. Check for missing type annotations

### Build Failures

**Error**: Production build fails

**Solution**:
1. Fix all TypeScript errors first
2. Check for console errors in development mode
3. Verify all environment variables are set
4. Check for missing dependencies
5. Review build output for specific error messages

---

## API Integration

### Backend Communication

The frontend expects the backend to be running on `http://localhost:8080`. All API calls are made to this base URL.

### API Request Format

**Property Search**:
```typescript
GET /api/properties/search?location=Boston,MA&status=for_sale&page=1
```

**Property Details**:
```typescript
GET /api/properties/{zpid}
```

**Cashflow Analysis**:
```typescript
POST /api/analysis/cashflow
Content-Type: application/json

{
  "offerPrice": 500000,
  "grossRentsAnnual": 48000,
  "propertyTaxes": 6000,
  // ... other fields
}
```

### Error Handling

The application handles various error scenarios:
- Backend not running: Shows user-friendly error message
- Network errors: Displays connection error
- API errors: Shows error details from backend
- Validation errors: Field-level error messages

### CORS Configuration

The backend must allow requests from `http://localhost:3000`. This is typically configured in the backend's CORS settings.

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MapBox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [Create React App Documentation](https://create-react-app.dev/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

## Support

For issues, questions, or contributions, please refer to the main project documentation or contact the development team.

---

**Version**: 0.1.0  
**Last Updated**: December 2025  