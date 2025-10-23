import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import './App.css';

function App() {
  const [activePage, setActivePage] = useState("my-properties");
  const [activeSection, setActiveSection] = useState("brrrr");

  // Google OAuth Client ID - Replace with your actual client ID
  const GOOGLE_CLIENT_ID = "your-google-client-id-here.apps.googleusercontent.com";

  const handleNavigate = (page: string) => {
    setActivePage(page);
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        <Navbar onNavigate={handleNavigate} activePage={activePage} />
        
        {/* Main Layout */}
        <div style={{ display: 'flex', height: 'calc(100vh - 4rem)' }}>
          {/* Sidebar */}
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange} 
          />
          
          {/* Main Content */}
          <MainContent activeSection={activeSection} />
        </div>

        {/* Notification Badge */}
        <div className="floating-notification">
          2
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
