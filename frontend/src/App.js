import React from 'react';
import './style.css';  // Import the CSS file here
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './pages/Home';
import DatabaseTest from './pages/DatabaseTest';
import About from './pages/About';

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Home</Link> | <Link to="/dbtest">Database Test</Link> | <Link to="/about">About</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dbtest" element={<DatabaseTest />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;