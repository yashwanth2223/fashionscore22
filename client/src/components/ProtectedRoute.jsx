import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // If still loading auth state, return null (could add a loading spinner here)
  if (loading) {
    return null;
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // If authenticated, render the child components
  return children;
};

export default ProtectedRoute; 