import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import { ThemeProvider } from './contexxt/ThemeContext';

const App = () => {
  return (
    <ThemeProvider>
      <Router>
        <Dashboard />
      </Router>
    </ThemeProvider>

  );
};

export default App;
