import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import DatabaseTest from './pages/DatabaseTest';
import ContactForm from './pages/ContactForm';
import About from './pages/About';
import Sidebar from './pages/Sidebar';
import './style.css';

function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

function AppContent() {
    const location = useLocation();
    const showSidebar = location.pathname !== '/';

    return (
        <div className="app-container">
            {showSidebar && <Sidebar />}
            <div className={showSidebar ? 'main-content' : 'main-content full-width'}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/database-test" element={<DatabaseTest />} />
                    <Route path="/contact" element={<ContactForm />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;