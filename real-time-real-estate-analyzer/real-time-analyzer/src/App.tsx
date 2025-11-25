import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PropertiesProvider } from './context/PropertiesContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Dashboard from './components/Dashboard';
import SearchPage from './components/SearchPage';
import PurchaseCriteriaForm from './components/PurchaseCriteriaForm';
import PropertyForm from './components/PropertyForm';
import AuthPage from './components/AuthPage';
import './App.css';

// Google OAuth Client ID - Get from environment variable or use placeholder
// To set up: Create a .env file in the root directory with:
// REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

// Debug: Log Client ID status (remove in production)
if (process.env.NODE_ENV === 'development') {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "" || GOOGLE_CLIENT_ID.includes('your-client-id')) {
    console.warn('Google OAuth Client ID not configured!');
    console.warn('Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file');
    console.warn('See QUICK_OAUTH_SETUP.md for instructions');
  } else {
    console.log('Google OAuth Client ID loaded:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');
  }
}

function AppContent() {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  const [activePage, setActivePage] = useState("my-properties");
  const [activeSection, setActiveSection] = useState("brrrr");
  // Default to 'auth' - always show landing page on initial load
  const [activeView, setActiveView] = useState<string | null>('auth');
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [propertyFormStrategy, setPropertyFormStrategy] = useState<'rental' | 'brrrr' | 'flip' | 'wholesale'>('rental');
  const [selectedPropertyZpid, setSelectedPropertyZpid] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState<string | null>(null);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    if (page === 'home' || page === 'my-properties' || page === 'dashboard') {
      setActiveView('dashboard');
      setActivePage('my-properties');
      setShowPropertyForm(false); // Close property form if open
    } else if (page === 'search-properties') {
      setActiveView('search-properties');
    } else if (page === 'search-lenders') {
      setActiveView('search-lenders');
    } else if (page === 'auth' || page === 'login') {
      setActiveView('auth');
    } else {
      setActiveView(null);
    }
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    setActiveView(null);
  };

  const handleItemClick = (itemId: string) => {
    // Handle sidebar item clicks
    if (itemId.includes('-properties')) {
      // Extract strategy from itemId (e.g., "rental-properties" -> "rental")
      // Map to correct strategy names
      const strategyMap: { [key: string]: 'rental' | 'brrrr' | 'flip' | 'wholesale' } = {
        'rental-properties': 'rental',
        'rentals-properties': 'rental',
        'brrrr-properties': 'brrrr',
        'flip-properties': 'flip',
        'flips-properties': 'flip',
        'wholesale-properties': 'wholesale'
      };
      const strategy = strategyMap[itemId] || 'rental';
      
      // Extract section name for filtering
      const sectionMap: { [key: string]: string } = {
        'rental-properties': 'rentals',
        'rentals-properties': 'rentals',
        'brrrr-properties': 'brrrr',
        'flip-properties': 'flips',
        'flips-properties': 'flips',
        'wholesale-properties': 'wholesale'
      };
      const section = sectionMap[itemId] || strategy;
      
      setActiveSection(section);
      setPropertyFormStrategy(strategy);
      setShowPropertyForm(true); // Open property form for adding properties of this type
      setActivePage('my-properties');
    } else if (itemId.includes('-criteria')) {
      // Extract section from itemId (e.g., "rental-criteria" -> "rental")
      const sectionMap: { [key: string]: 'rental' | 'brrrr' | 'flip' | 'wholesale' } = {
        'rental-criteria': 'rental',
        'rentals-criteria': 'rental',
        'brrrr-criteria': 'brrrr',
        'flip-criteria': 'flip',
        'flips-criteria': 'flip',
        'wholesale-criteria': 'wholesale'
      };
      const strategy = sectionMap[itemId] || 'rental';
      // Extract section name for filtering
      const sectionMapForSection: { [key: string]: string } = {
        'rental-criteria': 'rentals',
        'rentals-criteria': 'rentals',
        'brrrr-criteria': 'brrrr',
        'flip-criteria': 'flips',
        'flips-criteria': 'flips',
        'wholesale-criteria': 'wholesale'
      };
      const section = sectionMapForSection[itemId] || strategy;
      setActiveSection(section);
      setShowPropertyForm(false); // Ensure property form is closed
      setActiveView(`criteria-${strategy}`);
      setActivePage('my-properties');
    }
  };

  const handleCriteriaSave = (criteria: any) => {
    console.log('Purchase criteria saved:', criteria);
    // You can add logic to save criteria here
    setActiveView(null);
  };

  const handleAuthSuccess = () => {
    // After successful auth (sign in or guest), show dashboard
    setActiveView('dashboard');
    setActivePage('my-properties');
  };

  // Don't auto-navigate to dashboard on load - always start with auth page
  // User must explicitly authenticate to see dashboard

  // Show loading state
  if (isLoading) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f8fafc'
        }}>
          <div className="spinner"></div>
        </div>
      </GoogleOAuthProvider>
    );
  }

  // Show auth page as landing page if explicitly set to 'auth' view
  // This ensures the auth page is the first thing users see when they visit or restart the server
  if (activeView === 'auth') {
    // If Google Client ID is not configured, still show auth page but allow guest access
    // The AuthPage component will handle showing appropriate options
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "" || GOOGLE_CLIENT_ID.includes('your-client-id')) {
      // Show auth page without Google OAuth - guest access only
      return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        </div>
      );
    }

    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        </div>
      </GoogleOAuthProvider>
    );
  }

  const handleAddProperty = (strategy: 'rental' | 'brrrr' | 'flip' | 'wholesale') => {
    setPropertyFormStrategy(strategy);
    setShowPropertyForm(true);
  };

  // Determine what content to show
  const renderContent = () => {
    // Check for criteria view first (before property form)
    if (activeView?.startsWith('criteria-')) {
      const strategy = activeView.replace('criteria-', '') as 'rental' | 'brrrr' | 'flip' | 'wholesale';
      return (
        <PurchaseCriteriaForm
          strategy={strategy}
          onClose={() => {
            setActiveView('dashboard');
            setShowPropertyForm(false);
          }}
          onSave={handleCriteriaSave}
        />
      );
    }

    // Show PropertyForm if requested
    if (showPropertyForm) {
      return (
        <PropertyForm
          strategy={propertyFormStrategy}
          selectedZpid={selectedPropertyZpid}
          searchLocation={searchLocation}
          onClose={() => {
            setShowPropertyForm(false);
            setSelectedPropertyZpid(null);
            setSearchLocation(null);
            setActiveView('dashboard');
            // Set the active section to match the strategy
            const sectionMap: { [key: string]: string } = {
              'rental': 'rentals',
              'brrrr': 'brrrr',
              'flip': 'flips',
              'wholesale': 'wholesale'
            };
            const section = sectionMap[propertyFormStrategy] || 'rentals';
            setActiveSection(section);
          }}
        />
      );
    }

    if (activeView === 'dashboard' || activeView === null) {
      return <Dashboard onAddProperty={handleAddProperty} />;
    }

    if (activeView === 'search-properties') {
      return (
        <SearchPage 
          searchType="properties" 
          onClose={() => setActiveView('dashboard')}
          onPropertySelect={(zpid, strategy = 'rental', location) => {
            // Open PropertyForm with the selected property
            setPropertyFormStrategy(strategy);
            setSelectedPropertyZpid(zpid);
            setSearchLocation(location || null);
            setShowPropertyForm(true);
          }}
        />
      );
    }
    
    if (activeView === 'search-lenders') {
      return <SearchPage searchType="lenders" onClose={() => setActiveView('dashboard')} />;
    }

    // Default: show dashboard
    return <Dashboard />;
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Navbar onNavigate={handleNavigate} activePage={activePage} />
        
        {/* Main Layout */}
        {activeView !== 'search-properties' && activeView !== 'search-lenders' && (
          <div style={{ display: 'flex', height: 'calc(100vh - 4rem)' }}>
            {/* Sidebar */}
            <Sidebar 
              activeSection={activeSection} 
              onSectionChange={handleSectionChange}
              onItemClick={handleItemClick}
              onAddProperty={handleAddProperty}
            />
            
            {/* Main Content */}
            {renderContent()}
          </div>
        )}

        {/* Full-width content for search pages */}
        {(activeView === 'search-properties' || activeView === 'search-lenders') && (
          <div style={{ height: 'calc(100vh - 4rem)' }}>
            {renderContent()}
          </div>
        )}

        {/* Notification Badge */}
        <div className="floating-notification">
          2
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <PropertiesProvider>
        <AppContent />
      </PropertiesProvider>
    </AuthProvider>
  );
}

export default App;
