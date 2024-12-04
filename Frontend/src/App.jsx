import React from 'react';
import HomePage from './components/Home/HomePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductPage from './components/Products/ProductPage';

const App = () => {
  return (
    <Router>
      <div className='w-full h-screen  overflow-auto'>
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/products/' element={<ProductPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
