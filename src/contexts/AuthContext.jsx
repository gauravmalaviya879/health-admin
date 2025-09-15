import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in with valid token
    const savedAuth = localStorage.getItem('healthAdminAuth');
    const hasValidToken = authService.isTokenValid();
    
    if (savedAuth && hasValidToken) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUser(authData.user);
      setIsAdmin(authData.isAdmin);
    } else {
      // Clear invalid auth data
      authService.clearToken();
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Please enter both email and password' };
      }

      const result = await authService.login(email, password);
      if (result.success) {
        const { user } = result;
        
        setIsAuthenticated(true);
        setUser(user);
        setIsAdmin(user.isAdmin);
        
        // Save auth data to localStorage
        localStorage.setItem('healthAdminAuth', JSON.stringify({
          user,
          isAdmin: user.isAdmin,
          timestamp: Date.now()
        }));
        
        return { 
          success: true,
          isAdmin: user.isAdmin,
          user
        };
      } else {
        return { 
          success: false, 
          error: result.error || 'Login failed. Please check your credentials.' 
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: 'Login failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
    }
  };

  const value = {
    isAuthenticated,
    user,
    isAdmin,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
