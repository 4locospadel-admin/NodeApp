import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import ContactForm from './pages/ContactForm';
import Profile from './pages/Profile';
import Reservation from './pages/Reservation';
import About from './pages/About';
import Sidebar from './pages/Sidebar';
import ResetPassword from "./pages/ResetPassword";
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
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/reservation" element={<Reservation />} />
                    <Route path="/contact" element={<ContactForm />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;