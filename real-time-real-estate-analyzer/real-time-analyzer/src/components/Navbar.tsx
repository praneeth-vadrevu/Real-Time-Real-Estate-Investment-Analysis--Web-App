import React, { useState, useEffect, useRef } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { FiBell, FiUser, FiHelpCircle, FiSettings } from 'react-icons/fi';

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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleGoogleSuccess = (credentialResponse: any) => {
    console.log('Login Success:', credentialResponse);
    const userInfo = JSON.parse(atob(credentialResponse.credential.split('.')[1]));
    setUser(userInfo);
    setIsUserMenuOpen(false);
  };

  const handleGoogleError = () => {
    console.log('Login Failed');
  };

  const handleLogout = () => {
    setUser(null);
    setIsUserMenuOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

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
          <span className="logo-text">HouseHustle</span>
        </div>

        {/* Navigation Links */}
        <div className="nav-links">
          <button
            onClick={() => onNavigate('my-properties')}
            className={`nav-link ${activePage === 'my-properties' ? 'nav-link-active' : ''}`}
          >
            My Properties
          </button>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => onNavigate('search-properties')}
              className={`nav-link ${activePage === 'search-properties' ? 'nav-link-active' : ''}`}
            >
              Search Properties
            </button>
            <span className="new-badge">
              NEW
            </span>
          </div>
          <button
            onClick={() => onNavigate('search-lenders')}
            className={`nav-link ${activePage === 'search-lenders' ? 'nav-link-active' : ''}`}
          >
            Search Lenders
          </button>
        </div>
      </div>

      {/* Right side - Icons and User Menu */}
      <div className="navbar-right">
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
        <div className="user-menu" ref={dropdownRef}>
          {user ? (
            <>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="user-avatar-button"
              >
                <img
                  src={user.picture}
                  alt={user.name}
                  className="user-avatar"
                />
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="dropdown-menu">
                  <div className="dropdown-user-info">
                    <img
                      src={user.picture}
                      alt={user.name}
                      className="dropdown-user-avatar"
                    />
                    <div>
                      <p className="dropdown-user-name">{user.name}</p>
                      <p className="dropdown-user-email">{user.email}</p>
                    </div>
                  </div>
                  <hr style={{ margin: '0.5rem 0' }} />
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
            </>
          ) : (
            <>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="user-icon-button"
              >
                <FiUser style={{ width: '1.5rem', height: '1.5rem' }} />
              </button>

              {/* Dropdown Menu for Sign In */}
              {isUserMenuOpen && (
                <div className="dropdown-menu signin-dropdown">
                  <div className="signin-header">
                    <h3>Welcome!</h3>
                    <p>Sign in to access your account</p>
                  </div>
                  <div className="google-signin-container">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      text="signin_with"
                      shape="rectangular"
                      logo_alignment="left"
                      width="280"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;