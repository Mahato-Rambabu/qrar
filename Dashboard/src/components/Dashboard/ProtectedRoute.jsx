const ProtectedRoute = ({ children }) => {
  const [isSessionValid, setIsSessionValid] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  React.useEffect(() => {
    const validateSession = async () => {
      try {
        const response = await axiosInstance.get('/restaurants/validate-session');
        setIsSessionValid(response.data.isValid);
      } catch (err) {
        console.error('Session validation failed:', err);
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

  return isSessionValid ? children : <Navigate to="/login" />;
};