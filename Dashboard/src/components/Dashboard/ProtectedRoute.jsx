import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/auth';


console.log('Is authenticated:', isAuthenticated());

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />; // Redirect to login if not authenticated
  }
  return children;
};

export default ProtectedRoute;
