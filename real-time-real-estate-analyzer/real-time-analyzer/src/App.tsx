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
  // Default to null - will show auth page if not authenticated/guest, dashboard otherwise
  const [activeView, setActiveView] = useState<string | null>(null);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [propertyFormStrategy, setPropertyFormStrategy] = useState<'rental' | 'brrrr' | 'flip' | 'wholesale'>('rental');
  const [selectedPropertyZpid, setSelectedPropertyZpid] = useState<string | null>(null);

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

  // After loading, if user is authenticated or guest, show dashboard by default
  // Otherwise, auth page will be shown (handled in the condition below)
  useEffect(() => {
    if (!isLoading && (isAuthenticated || isGuest) && activeView === null) {
      setActiveView('dashboard');
    }
  }, [isLoading, isAuthenticated, isGuest, activeView]);

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

  // Show auth page as landing page if not authenticated and not guest, or if explicitly navigating to auth
  // This ensures the auth page is the first thing users see when they visit
  if (activeView === 'auth' || (!isAuthenticated && !isGuest)) {
    // Check if Google Client ID is configured
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === "") {
      return (
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <div style={{
            maxWidth: '600px',
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '1rem' }}>Google OAuth Client ID Not Configured</h2>
            <p style={{ marginBottom: '1.5rem', color: '#374151' }}>
              To enable Google Sign-In, you need to set up a Google OAuth Client ID.
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.75rem', color: '#111827' }}>Setup Instructions:</h3>
              <ol style={{ marginLeft: '1.5rem', color: '#6b7280', lineHeight: '1.75' }}>
                <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>Google Cloud Console</a></li>
                <li>Create a new project or select an existing one</li>
                <li>Enable Google+ API</li>
                <li>Go to "Credentials" → "Create Credentials" → "OAuth client ID"</li>
                <li>Select "Web application"</li>
                <li>Add authorized JavaScript origins: <code style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>http://localhost:3000</code></li>
                <li>Copy your Client ID</li>
                <li>Create a <code style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>.env</code> file in the project root with: <br/>
                  <code style={{ backgroundColor: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', display: 'block', marginTop: '0.5rem' }}>REACT_APP_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com</code>
                </li>
                <li>Restart the development server</li>
              </ol>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
              style={{ marginRight: '0.5rem' }}
            >
              Reload Page
            </button>
            <button
              onClick={handleAuthSuccess}
              className="btn-secondary"
            >
              Continue as Guest
            </button>
          </div>
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
          onClose={() => {
            setShowPropertyForm(false);
            setSelectedPropertyZpid(null);
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
          onPropertySelect={(zpid, strategy = 'rental') => {
            // Open PropertyForm with the selected property
            setPropertyFormStrategy(strategy);
            setSelectedPropertyZpid(zpid);
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
