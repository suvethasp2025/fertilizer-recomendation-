import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Load user profile if token is available
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.get('/api/users/profile');
          setUser(res.data);
        } catch (error) {
          console.error("Token verification failed:", error);
          logout();
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, [token]);

  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    try {
      // We use the JSON-based login endpoint we created
      const res = await api.post('/api/auth/login-json', { email, password });
      const { access_token, role, name } = res.data;
      
      localStorage.setItem('token', access_token);
      setToken(access_token);
      
      // Fetch full profile details
      const profileRes = await api.get('/api/users/profile');
      setUser(profileRes.data);
      
      toast.success(`Welcome back, ${profileRes.data.name}!`);
      return { success: true, role };
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Invalid email or password';
      toast.error(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Signup handler
  const signup = async (userData) => {
    setLoading(true);
    try {
      await api.post('/api/auth/signup', userData);
      toast.success('Registration successful! Please login.');
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Registration failed';
      toast.error(errMsg);
      return { success: false, error: errMsg };
    } finally {
      setLoading(false);
    }
  };

  // Logout handler
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Logged out successfully');
  };

  // Update profile handler
  const updateProfile = async (profileData) => {
    try {
      const res = await api.put('/api/users/profile', profileData);
      setUser(prev => ({ ...prev, ...res.data.user }));
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Failed to update profile';
      toast.error(errMsg);
      return { success: false, error: errMsg };
    }
  };

  // Delete account handler
  const deleteAccount = async () => {
    try {
      await api.delete('/api/users/profile');
      logout();
      toast.success('Your account has been deleted.');
      return { success: true };
    } catch (error) {
      const errMsg = error.response?.data?.detail || 'Failed to delete account';
      toast.error(errMsg);
      return { success: false, error: errMsg };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateProfile, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
};
