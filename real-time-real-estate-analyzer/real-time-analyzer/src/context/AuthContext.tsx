import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

/**
 * User information interface.
 * Contains data from Google OAuth authentication.
 */
export interface User {
  name: string;
  email: string;
  picture: string;
  sub: string; // Google user ID
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  browseAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication context provider.
 * Manages user authentication state and provides authentication methods.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load authentication state from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedGuest = localStorage.getItem('isGuest');
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
    
    if (storedGuest === 'true') {
      setIsGuest(true);
    }
    
    setIsLoading(false);
  }, []);

  /**
   * Logs in a user with their user data.
   * 
   * @param userData The user information to store
   */
  const login = (userData: User) => {
    setUser(userData);
    setIsGuest(false);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.removeItem('isGuest');
  };

  /**
   * Sets the user to guest mode.
   * Removes any authenticated user and enables guest access.
   */
  const browseAsGuest = () => {
    setUser(null);
    setIsGuest(true);
    localStorage.setItem('isGuest', 'true');
    localStorage.removeItem('user');
  };

  /**
   * Logs out the current user.
   * Clears both authenticated and guest states.
   */
  const logout = () => {
    setUser(null);
    setIsGuest(false);
    localStorage.removeItem('user');
    localStorage.removeItem('isGuest');
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isGuest,
    isLoading,
    login,
    logout,
    browseAsGuest,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

