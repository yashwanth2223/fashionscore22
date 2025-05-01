import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAttempts } from './AttemptsContext';

// Create auth context
const AuthContext = createContext();

// Create provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // We can't use useAttempts here because it would cause a circular dependency
  // Instead, we'll pass a resetAttempts function to login and register

  // Configure axios to include credentials
  axios.defaults.withCredentials = true;

  // Check if user is already logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/user');
        setUser(res.data.user);
      } catch (error) {
        // User is not logged in or token is invalid
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Register user
  const register = async (userData, resetAttempts) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      setUser(res.data.user);
      toast.success('Registration successful!');
      
      // Reset attempts if function was provided
      if (typeof resetAttempts === 'function') {
        resetAttempts();
      }
      
      return true;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  // Login user
  const login = async (credentials, resetAttempts) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', credentials);
      setUser(res.data.user);
      toast.success('Login successful!');
      
      // Reset attempts if function was provided
      if (typeof resetAttempts === 'function') {
        resetAttempts();
      }
      
      return true;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/auth/logout');
      setUser(null);
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout error', error);
      toast.error('Logout failed');
    }
  };

  // Delete account
  const deleteAccount = async () => {
    try {
      await axios.delete('http://localhost:5000/api/user');
      setUser(null);
      toast.info('Account deleted successfully');
      return true;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to delete account';
      toast.error(message);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        deleteAccount
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 