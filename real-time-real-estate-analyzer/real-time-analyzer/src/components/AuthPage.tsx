import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiUser, FiSettings } from 'react-icons/fi';

interface AuthPageProps {
  onAuthSuccess?: () => void;
}

// Get Google Client ID from environment
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || "";
const hasGoogleAuth = GOOGLE_CLIENT_ID && GOOGLE_CLIENT_ID !== "" && !GOOGLE_CLIENT_ID.includes('your-client-id');

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const { login, browseAsGuest } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBrowseAsGuest = () => {
    browseAsGuest();
    if (onAuthSuccess) {
      onAuthSuccess();
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      // Decode the JWT token to get user info
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      const userInfo = JSON.parse(jsonPayload);

      // Create user object
      const user = {
        name: userInfo.name || 'User',
        email: userInfo.email || '',
        picture: userInfo.picture || '',
        sub: userInfo.sub || '',
      };

      // Save user to context and localStorage
      login(user);

      // Optional: Send to backend for verification/storage
      // You can add API call here to save user to your backend
      try {
        const response = await fetch('http://localhost:8080/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: credentialResponse.credential,
            user: user,
          }),
        });

        if (!response.ok) {
          console.warn('Backend authentication failed, but proceeding with local auth');
        }
      } catch (backendError) {
        console.warn('Backend not available, using local authentication only');
      }

      // Redirect to home page
      if (onAuthSuccess) {
        onAuthSuccess();
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = (error?: any) => {
    console.error('Google authentication error:', error);
    console.error('Full error details:', JSON.stringify(error, null, 2));
    
    if (error?.error === 'popup_closed_by_user') {
      setError('Sign-in was cancelled. Please try again.');
    } else if (error?.error === 'access_denied') {
      setError('Access was denied. Please try again and grant the necessary permissions.');
    } else if (error?.error === 'invalid_client' || error?.error?.includes('invalid_client')) {
      setError('Invalid Client ID. Please check: 1) Client ID is correct in .env file, 2) http://localhost:3000 is added to Authorized JavaScript origins in Google Cloud Console, 3) Server was restarted after updating .env');
    } else if (error?.error === 'origin_mismatch') {
      setError('Origin mismatch. Please add http://localhost:3000 to Authorized JavaScript origins in Google Cloud Console.');
    } else {
      setError(`Google authentication failed: ${error?.error || error?.message || 'Unknown error'}. Please check browser console for details.`);
    }
    setIsLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-left">
          <div className="auth-branding">
            <div className="auth-logo">
              <svg className="w-8 h-8 text-blue-800" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
              </svg>
            </div>
            <h1 className="auth-title">HouseHustle</h1>
            <p className="auth-tagline">Real-Time Real Estate Investment Analysis</p>
          </div>

          <div className="auth-features">
            <div className="auth-feature">
              <FiHome className="feature-icon" />
              <div>
                <h3>Property Management</h3>
                <p>Manage and analyze your real estate portfolio</p>
              </div>
            </div>
            <div className="auth-feature">
              <FiSettings className="feature-icon" />
              <div>
                <h3>Secure & Private</h3>
                <p>Your data is protected with industry-standard security</p>
              </div>
            </div>
            <div className="auth-feature">
              <FiUser className="feature-icon" />
              <div>
                <h3>Personalized Analysis</h3>
                <p>Custom investment criteria and analysis tools</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="auth-right">
          <div className="auth-form-container">
            <div className="auth-form-header">
              <h2>Welcome to HouseHustle</h2>
              <p>Sign in to access your real estate investment tools</p>
            </div>

            {error && (
              <div className="auth-error">
                <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {hasGoogleAuth && (
              <>
                <div className="auth-google-container">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme="outline"
                    size="large"
                    text="signin_with"
                    shape="rectangular"
                    logo_alignment="left"
                    width="100%"
                    useOneTap={false}
                  />
                </div>

                <div className="auth-divider">
                  <span>or</span>
                </div>
              </>
            )}

            {!hasGoogleAuth && (
              <div style={{ 
                backgroundColor: '#fef3c7', 
                border: '1px solid #fbbf24', 
                borderRadius: '0.5rem', 
                padding: '1rem', 
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <p style={{ color: '#92400e', fontSize: '0.875rem', margin: 0 }}>
                  <strong>Note:</strong> Google Sign-In is not configured. You can still use the app as a guest.
                </p>
              </div>
            )}

            <button
              onClick={handleBrowseAsGuest}
              className="btn-secondary auth-guest-button"
              disabled={isLoading}
            >
              <svg className="guest-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Browse as Guest
            </button>

            <div className="auth-info">
              <p className="auth-info-text">
                By signing in, you agree to our{' '}
                <a href="#" className="auth-link">Terms of Service</a> and{' '}
                <a href="#" className="auth-link">Privacy Policy</a>
              </p>
            </div>

            {isLoading && (
              <div className="auth-loading">
                <div className="spinner"></div>
                <p>Authenticating...</p>
              </div>
            )}

            <div className="auth-footer">
              <p>
                Don't have a Google account?{' '}
                <a href="https://accounts.google.com/signup" target="_blank" rel="noopener noreferrer" className="auth-link">
                  Create one here
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

