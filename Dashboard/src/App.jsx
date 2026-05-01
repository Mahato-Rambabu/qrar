import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexxt/ThemeContext';

const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const LoginPage = lazy(() => import('./components/SignUp/LoginPage'));
const RegisterPage = lazy(() => import('./components/SignUp/RegisterPage'));

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Suspense fallback={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: '#0c0a08',
            color: '#c48f48',
            fontFamily: 'DM Mono, monospace',
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase'
          }}>
            Loading...
          </div>
        }>
          <Routes>
            {/* ✅ Auth pages — full screen, no Navbar/Sidebar */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* ✅ Everything else — goes through Dashboard (Navbar + Sidebar) */}
            <Route path="/*" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};

export default App;