import React from 'react';
import { Navigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const ProtectedRoute = ({ children }) => {
  const [isSessionValid, setIsSessionValid] = React.useState(false);
  const [checkingSession, setCheckingSession] = React.useState(true);

  React.useEffect(() => {
    // Check server-side session validity
    const validateSession = async () => {
      try {
        await axiosInstance.get('/auth/validate-session');
        setIsSessionValid(true);
      } catch (err) {
        setIsSessionValid(false);
      } finally {
        setCheckingSession(false);
      }
    };
    validateSession();
  }, []);

  if (checkingSession) {
    return <div>Loading...</div>;
  }

  if (!isSessionValid) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;