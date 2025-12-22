# Frontend Developer Guide

> **Version:** 1.0.0  
> **Last Updated:** December 2025  
> **Audience:** Frontend Developers, Contributors

---

## Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Development Environment Setup](#2-development-environment-setup)
3. [Code Structure](#3-code-structure)
4. [Component Architecture](#4-component-architecture)
5. [State Management](#5-state-management)
6. [API Integration](#6-api-integration)
7. [Development Workflow](#7-development-workflow)
8. [Testing](#8-testing)
9. [Code Style Guidelines](#9-code-style-guidelines)
10. [Building and Deployment](#10-building-and-deployment)

---

## 1. Architecture Overview

### Technology Stack

- **React 19.2.0**: UI library for building user interfaces
- **TypeScript 4.9.5**: Type-safe JavaScript
- **Create React App 5.0.1**: Build tooling and development environment
- **React Context API**: Global state management
- **MapBox GL**: Interactive map visualization
- **Google OAuth**: User authentication

### Application Structure

```
Frontend (Port 3000)
├── React Components
│   ├── Pages (AuthPage, Dashboard, SearchPage)
│   ├── Forms (PropertyForm, PurchaseCriteriaForm)
│   ├── Views (PropertyMap, PropertyReportViewer, PropertyComparison)
│   └── Layout (Navbar, Sidebar, Footer)
├── Context Providers
│   ├── AuthContext (Authentication state)
│   └── PropertiesContext (Saved properties state)
├── Utilities
│   ├── cashflowApi.ts (Backend API integration)
│   └── reportGenerator.ts (Report generation)
└── Configuration
    ├── .env (Environment variables)
    └── tsconfig.json (TypeScript config)
```

### Data Flow

1. User interacts with React components
2. Components dispatch actions to Context providers
3. Context providers update state and persist to localStorage
4. API calls made to backend (port 8080) via utility functions
5. Responses update component state and trigger re-renders

---

## 2. Development Environment Setup

### Prerequisites

- **Node.js 18+**: [Download](https://nodejs.org/)
- **npm or yarn**: Comes with Node.js
- **Git**: [Download](https://git-scm.com/)

### Installation Steps

```bash
# Navigate to frontend directory
cd real-time-real-estate-analyzer/real-time-analyzer

# Install dependencies
npm install

# Verify installation
npm list --depth=0
```

### IDE Setup

**VS Code (Recommended)**
1. Install extensions:
   - ESLint
   - Prettier
   - TypeScript and JavaScript Language Features
   - React snippets
2. Open the `real-time-analyzer` folder
3. Configure workspace settings for consistent formatting

**WebStorm**
1. Open the `real-time-analyzer` folder
2. Configure TypeScript compiler
3. Enable ESLint integration

### Environment Configuration

Create `.env` file in `real-time-real-estate-analyzer/real-time-analyzer/`:

```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
REACT_APP_MAPBOX_ACCESS_TOKEN=your-mapbox-access-token
```

**Important**: 
- Variables must start with `REACT_APP_`
- Restart dev server after changing `.env`
- Never commit `.env` to version control

---

## 3. Code Structure

### Directory Organization

```
src/
├── components/          # React components
│   ├── AuthPage.tsx
│   ├── Dashboard.tsx
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── SearchPage.tsx
│   ├── PropertyForm.tsx
│   ├── PropertyMap.tsx
│   ├── PropertyReportViewer.tsx
│   ├── PropertyComparison.tsx
│   ├── PropertySearch.tsx
│   ├── PropertyPopup.tsx
│   ├── PurchaseCriteriaForm.tsx
│   ├── MainContent.tsx
│   └── Footer.tsx
├── context/             # React Context providers
│   ├── AuthContext.tsx
│   └── PropertiesContext.tsx
├── utils/               # Utility functions
│   ├── cashflowApi.ts
│   └── reportGenerator.ts
├── App.tsx              # Main application component
├── App.css              # Application styles
├── index.tsx            # Application entry point
└── index.css            # Global styles
```

### Naming Conventions

- **Components**: PascalCase (e.g., `PropertyForm.tsx`)
- **Files**: Match component name
- **Functions**: camelCase (e.g., `handlePropertySelect`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_PROPERTIES`)
- **Interfaces/Types**: PascalCase (e.g., `PropertyData`)

---

## 4. Component Architecture

### Component Hierarchy

```
App.tsx
├── AuthContext.Provider
├── PropertiesContext.Provider
└── AppContent
    ├── Navbar
    ├── AuthPage (if not authenticated)
    └── Main Application (if authenticated)
        ├── Dashboard
        │   ├── PropertyMap
        │   └── PropertyComparison
        ├── SearchPage
        │   ├── PropertySearch
        │   └── PropertyMap
        └── PropertyForm
            └── PropertyReportViewer
```

### Key Components

**App.tsx**
- Main application router
- Manages page navigation
- Wraps application with context providers

**AuthPage.tsx**
- Handles Google OAuth authentication
- Guest mode access
- JWT token decoding

**Dashboard.tsx**
- Displays saved properties
- Property filtering and search
- List and map view toggles
- Property management actions

**SearchPage.tsx**
- Property search interface
- Backend API integration
- Search result display
- Property selection

**PropertyForm.tsx**
- Comprehensive property data input
- Auto-fill from Zillow API
- Form validation
- Cashflow analysis trigger
- Report generation

**PropertyMap.tsx**
- MapBox GL integration
- Property marker display
- Geocoding functionality
- Interactive map controls

### Component Patterns

**Functional Components with Hooks**
```typescript
import React, { useState, useEffect } from 'react';

interface ComponentProps {
  title: string;
  onAction: (value: string) => void;
}

const Component: React.FC<ComponentProps> = ({ title, onAction }) => {
  const [state, setState] = useState<string>('');
  
  useEffect(() => {
    // Side effects
  }, []);
  
  return (
    <div>
      <h1>{title}</h1>
      {/* Component JSX */}
    </div>
  );
};

export default Component;
```

---

## 5. State Management

### React Context API

The application uses Context API for global state management.

**AuthContext**
- Manages user authentication state
- Provides login, logout, and guest mode functions
- Persists authentication to localStorage

```typescript
const { user, isAuthenticated, login, logout } = useAuth();
```

**PropertiesContext**
- Manages saved properties collection
- Provides CRUD operations for properties
- Persists properties to localStorage

```typescript
const { properties, addProperty, updateProperty, deleteProperty } = useProperties();
```

### Local State

Components use `useState` for local state:
- Form inputs
- UI state (modals, dropdowns)
- Loading states
- Error messages

### State Persistence

- **Authentication**: Stored in localStorage as `auth_user`
- **Properties**: Stored in localStorage as `saved_properties`
- **Guest Mode**: Stored in localStorage as `is_guest`

---

## 6. API Integration

### Backend API Base URL

```
http://localhost:8080
```

### API Endpoints

**Property Search**
```typescript
GET /api/properties/search?location={location}&status={status}&page={page}
```

**Property Details**
```typescript
GET /api/properties/{zpid}
```

**Cashflow Analysis**
```typescript
POST /api/analysis/cashflow
Content-Type: application/json
Body: CashflowRequest
```

### API Utility Functions

Located in `src/utils/cashflowApi.ts`:

```typescript
// Map form data to API request format
mapPropertyDataToCashflowRequest(formData: PropertyData): CashflowRequest

// Send cashflow analysis request
analyzeCashflow(request: CashflowRequest): Promise<CashflowResponse>
```

### Error Handling

API calls include error handling:
- Network errors: Display connection error message
- Backend not running: Show user-friendly error
- API errors: Display error details from backend
- Timeout handling: 10-second timeout for requests

### External APIs

**MapBox API**
- Direct integration in `PropertyMap.tsx`
- Used for map display and geocoding
- Token from `REACT_APP_MAPBOX_ACCESS_TOKEN`

**Google OAuth**
- Direct integration via `@react-oauth/google`
- Used for user authentication
- Client ID from `REACT_APP_GOOGLE_CLIENT_ID`

---

## 7. Development Workflow

### Starting Development Server

```bash
npm start
```

Features:
- Hot module replacement
- Error overlay in browser
- Source maps for debugging
- Fast refresh for components

### Making Changes

1. Edit component files in `src/components/`
2. Changes automatically reload in browser
3. Check browser console for errors
4. Use React DevTools for component inspection

### Adding New Features

1. Create component in `src/components/`
2. Add TypeScript interfaces for props
3. Integrate with Context if needed
4. Add API calls in `src/utils/` if needed
5. Update routing in `App.tsx`
6. Test functionality

### Code Quality

**Linting**
```bash
npm run lint
```

**Type Checking**
```bash
npx tsc --noEmit
```

---

## 8. Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Test Structure

Tests are co-located with components:
```
src/
├── components/
│   ├── Component.tsx
│   └── Component.test.tsx
```

### Writing Tests

```typescript
import { render, screen } from '@testing-library/react';
import Component from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

---

## 9. Code Style Guidelines

### TypeScript

- Use interfaces for object types
- Avoid `any` type
- Use type annotations for function parameters
- Leverage TypeScript's type inference where appropriate

### React Patterns

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components focused and single-purpose
- Use props destructuring

### Code Formatting

- Use 2 spaces for indentation
- Maximum line length: 120 characters
- Use semicolons
- Use single quotes for strings
- Trailing commas in objects and arrays

### Comments

- Add JSDoc comments for functions
- Explain complex logic with inline comments
- Keep comments concise and meaningful
- Update comments when code changes

### Example

```typescript
/**
 * Handles property selection from search results.
 * Fetches property details and auto-fills form.
 * 
 * @param zpid Zillow Property ID
 */
const handlePropertySelect = async (zpid: string) => {
  // Implementation
};
```

---

## 10. Building and Deployment

### Production Build

```bash
npm run build
```

Creates optimized build in `build/` directory:
- Minified JavaScript and CSS
- Optimized assets
- Source maps for debugging
- Production-ready static files

### Build Output

```
build/
├── index.html
├── static/
│   ├── css/
│   ├── js/
│   └── media/
└── asset-manifest.json
```

### Deployment Options

**Static Hosting**
- Netlify: Drag and drop `build/` folder
- Vercel: Connect repository
- GitHub Pages: Use `gh-pages` package
- AWS S3: Upload build contents

**Environment Variables in Production**
- Set in hosting platform settings
- Ensure `REACT_APP_` prefix is maintained
- Restart/redeploy after changes

### Performance Optimization

- Code splitting with React.lazy()
- Image optimization
- Bundle size analysis: `npm run build -- --analyze`
- Minimize API calls
- Use React.memo() for expensive components

---

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [MapBox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/)
- [Create React App Documentation](https://create-react-app.dev/)
- [React Context API](https://react.dev/reference/react/useContext)

---

*Last Updated: December 2025*
