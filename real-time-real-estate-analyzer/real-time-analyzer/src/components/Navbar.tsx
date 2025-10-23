import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { FiSearch, FiBell, FiUser, FiChevronDown, FiHelpCircle, FiSettings } from 'react-icons/fi';

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

interface User {
  name: string;
  email: string;
  picture: string;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log('Login Success:', credentialResponse);
    const userInfo = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
    setUser(userInfo);
  };

  const handleGoogleError = () => {
    console.log('Login Failed');
  };

  const handleLogout = () => {
    setUser(null);
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="navbar">
      {/* Left side - Logo and Navigation */}
      <div className="navbar-left">
        {/* Logo */}
        <div className="logo-container">
          <div className="logo-icon">
            <svg className="w-5 h-5 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
          </div>
          <span className="logo-text">Real Time Analyzer</span>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <button
            onClick={() => onNavigate('my-properties')}
            className="nav-link"
          >
            My Properties
          </button>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => onNavigate('search-properties')}
              className="nav-link"
            >
              Search Properties
            </button>
            <span className="new-badge">
              NEW
            </span>
          </div>
          <button
            onClick={() => onNavigate('search-lenders')}
            className="nav-link"
          >
            Search Lenders
          </button>
        </div>
      </div>

      {/* Right side - Search, Icons, and User Menu */}
      <div className="navbar-right">
        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
          />
          <FiSearch className="search-icon" />
        </div>

        {/* Icons */}
        <button className="icon-button">
          <FiHelpCircle style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>
        <button className="icon-button" style={{ position: 'relative' }}>
          <FiBell style={{ width: '1.25rem', height: '1.25rem' }} />
          <span className="notification-badge">2</span>
        </button>
        <button className="icon-button">
          <FiSettings style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>

        {/* User Menu */}
        <div className="user-menu">
          {user ? (
            <div className="user-info">
              <div className="user-info">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="user-avatar"
                />
                <div>
                  <p className="user-name">{user.name}</p>
                </div>
              </div>
              
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="icon-button"
              >
                <FiChevronDown style={{ width: '1rem', height: '1rem' }} />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="dropdown-menu">
                  <button
                    onClick={() => {
                      onNavigate('profile');
                      setIsUserMenuOpen(false);
                    }}
                    className="dropdown-item"
                  >
                    <FiUser style={{ width: '1rem', height: '1rem' }} />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setIsUserMenuOpen(false);
                    }}
                    className="dropdown-item"
                  >
                    <FiSettings style={{ width: '1rem', height: '1rem' }} />
                    <span>Settings</span>
                  </button>
                  <hr style={{ margin: '0.25rem 0' }} />
                  <button
                    onClick={handleLogout}
                    className="dropdown-item logout"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="medium"
              text="signin_with"
              shape="rectangular"
              logo_alignment="left"
            />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;