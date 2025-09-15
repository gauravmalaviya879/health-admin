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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in with valid token
    const savedAuth = localStorage.getItem('healthAdminAuth');
    const hasValidToken = authService.isTokenValid();
    
    if (savedAuth && hasValidToken) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUser(authData.user);
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
        const { token, user, data } = result;
        
        // Store token
        if (token) {
          authService.setToken(token);
        }
        
        // Set user data
       
        const userData =  {
         
          email: user.email,
        
        };
        
        setIsAuthenticated(true);
        setUser(userData);
        
        // Save auth data to localStorage
        localStorage.setItem('healthAdminAuth', JSON.stringify({
          user: userData,
          timestamp: Date.now()
        }));
        
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
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
    }
  };

  const value = {
    isAuthenticated,
    user,
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
