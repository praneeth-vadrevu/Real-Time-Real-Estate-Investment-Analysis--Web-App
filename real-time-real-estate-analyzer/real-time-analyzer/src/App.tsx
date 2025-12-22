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
import Footer from './components/Footer';
import './App.css';

// Get Google OAuth Client ID from environment variables
// To configure: Create a .env file with REACT_APP_GOOGLE_CLIENT_ID=your-client-id
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";

// Log configuration status in development mode
if (process.env.NODE_ENV === 'development') {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "" || GOOGLE_CLIENT_ID.includes('your-client-id')) {
    console.warn('Google OAuth Client ID not configured!');
    console.warn('Please set REACT_APP_GOOGLE_CLIENT_ID in your .env file');
  } else {
    console.log('Google OAuth Client ID loaded:', GOOGLE_CLIENT_ID.substring(0, 20) + '...');
  }
}

/**
 * Main application content component.
 * Handles routing and state management for the entire application.
 */
function AppContent() {
  const { isAuthenticated, isGuest, isLoading } = useAuth();
  
  // Navigation state
  const [activePage, setActivePage] = useState("my-properties");
  const [activeSection, setActiveSection] = useState("brrrr");
  const [activeView, setActiveView] = useState<string | null>('auth');
  
  // Property form state
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [propertyFormStrategy, setPropertyFormStrategy] = useState<'rental' | 'brrrr' | 'flip' | 'wholesale'>('rental');
  const [selectedPropertyZpid, setSelectedPropertyZpid] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState<string | null>(null);

  /**
   * Handles navigation between different pages in the application.
   * 
   * @param page The page identifier to navigate to
   */
  const handleNavigate = (page: string) => {
    setActivePage(page);
    
    if (page === 'home' || page === 'my-properties' || page === 'dashboard') {
      setActiveView('dashboard');
      setActivePage('my-properties');
      setShowPropertyForm(false);
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

  /**
   * Handles clicks on sidebar items.
   * Opens property form or criteria form based on the item clicked.
   * 
   * @param itemId The ID of the sidebar item that was clicked
   */
  const handleItemClick = (itemId: string) => {
    if (itemId.includes('-properties')) {
      // Map item IDs to strategy types
      const strategyMap: { [key: string]: 'rental' | 'brrrr' | 'flip' | 'wholesale' } = {
        'rental-properties': 'rental',
        'rentals-properties': 'rental',
        'brrrr-properties': 'brrrr',
        'flip-properties': 'flip',
        'flips-properties': 'flip',
        'wholesale-properties': 'wholesale'
      };
      const strategy = strategyMap[itemId] || 'rental';
      
      // Map item IDs to section names for filtering
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
      setShowPropertyForm(true);
      setActivePage('my-properties');
    } else if (itemId.includes('-criteria')) {
      // Map criteria item IDs to strategy types
      const strategyMap: { [key: string]: 'rental' | 'brrrr' | 'flip' | 'wholesale' } = {
        'rental-criteria': 'rental',
        'rentals-criteria': 'rental',
        'brrrr-criteria': 'brrrr',
        'flip-criteria': 'flip',
        'flips-criteria': 'flip',
        'wholesale-criteria': 'wholesale'
      };
      const strategy = strategyMap[itemId] || 'rental';
      
      // Map criteria item IDs to section names
      const sectionMap: { [key: string]: string } = {
        'rental-criteria': 'rentals',
        'rentals-criteria': 'rentals',
        'brrrr-criteria': 'brrrr',
        'flip-criteria': 'flips',
        'flips-criteria': 'flips',
        'wholesale-criteria': 'wholesale'
      };
      const section = sectionMap[itemId] || strategy;
      
      setActiveSection(section);
      setShowPropertyForm(false);
      setActiveView(`criteria-${strategy}`);
      setActivePage('my-properties');
    }
  };

  /**
   * Handles saving purchase criteria.
   * 
   * @param criteria The criteria data to save
   */
  const handleCriteriaSave = (criteria: any) => {
    console.log('Purchase criteria saved:', criteria);
    setActiveView(null);
  };

  /**
   * Handles successful authentication.
   * Navigates to dashboard after user signs in or chooses guest mode.
   */
  const handleAuthSuccess = () => {
    setActiveView('dashboard');
    setActivePage('my-properties');
  };

  // Show loading spinner while checking authentication state
  if (isLoading) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div style={{ 
          minHeight: '100vh',
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            flex: 1
          }}>
            <div className="spinner"></div>
          </div>
          <Footer />
        </div>
      </GoogleOAuthProvider>
    );
  }

  // Show authentication page as landing page
  if (activeView === 'auth') {
    // If Google Client ID is not configured, show auth page with guest access only
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "" || GOOGLE_CLIENT_ID.includes('your-client-id')) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        </div>
        <Footer />
      </div>
    );
    }

    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1 }}>
            <AuthPage onAuthSuccess={handleAuthSuccess} />
          </div>
          <Footer />
        </div>
      </GoogleOAuthProvider>
    );
  }

  /**
   * Opens the property form for adding a new property.
   * 
   * @param strategy The investment strategy for the property
   */
  const handleAddProperty = (strategy: 'rental' | 'brrrr' | 'flip' | 'wholesale') => {
    setPropertyFormStrategy(strategy);
    setShowPropertyForm(true);
  };

  /**
   * Determines which content component to render based on current view state.
   * 
   * @returns The appropriate React component to display
   */
  const renderContent = () => {
    // Show purchase criteria form if criteria view is active
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

    // Show property form if it should be displayed
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
            
            // Set active section to match the strategy
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

    // Show dashboard as default view
    if (activeView === 'dashboard' || activeView === null) {
      return <Dashboard onAddProperty={handleAddProperty} />;
    }

    // Show property search page
    if (activeView === 'search-properties') {
      return (
        <SearchPage 
          searchType="properties" 
          onClose={() => setActiveView('dashboard')}
          onPropertySelect={(zpid, strategy = 'rental', location) => {
            setPropertyFormStrategy(strategy);
            setSelectedPropertyZpid(zpid);
            setSearchLocation(location || null);
            setShowPropertyForm(true);
          }}
        />
      );
    }
    
    // Show lender search page
    if (activeView === 'search-lenders') {
      return <SearchPage searchType="lenders" onClose={() => setActiveView('dashboard')} />;
    }

    // Default to dashboard
    return <Dashboard />;
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
        <Navbar onNavigate={handleNavigate} activePage={activePage} />
        
        {/* Main Layout */}
        {activeView !== 'search-properties' && activeView !== 'search-lenders' && (
          <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
            {/* Sidebar */}
            <Sidebar 
              activeSection={activeSection} 
              onSectionChange={handleSectionChange}
              onItemClick={handleItemClick}
              onAddProperty={handleAddProperty}
            />
            
            {/* Main Content */}
            <div style={{ flex: 1, overflow: 'auto' }}>
              {renderContent()}
            </div>
          </div>
        )}

        {/* Full-width content for search pages */}
        {(activeView === 'search-properties' || activeView === 'search-lenders') && (
          <div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
            {renderContent()}
          </div>
        )}

        {/* Notification Badge */}
        <div className="floating-notification">
          2
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </GoogleOAuthProvider>
  );
}

/**
 * Main App component.
 * Wraps the application with context providers for authentication and properties.
 */
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
