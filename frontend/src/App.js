/**
 * @file App.js
 * @description The main entry point for the React application. Configures routing, layout, and conditional rendering of the sidebar.
 */

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

/**
 * The root component for the application.
 * 
 * Wraps the `AppContent` component with a `Router` to handle routing.
 *
 * @component
 * @example
 * // Usage in the React DOM
 * import ReactDOM from 'react-dom';
 * import App from './App';
 * 
 * ReactDOM.render(<App />, document.getElementById('root'));
 */
function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}

/**
 * Renders the main application layout, including conditional rendering of the `Sidebar`.
 * 
 * - Displays the `Sidebar` on all routes except the root `/` route.
 * - Defines the routing for the application, linking paths to their respective components.
 *
 * @component
 * @example
 * <AppContent />
 *
 * @returns {JSX.Element} The layout of the application with dynamic content based on the current route.
 */
function AppContent() {
    const location = useLocation();
    const showSidebar = location.pathname !== '/';

    return (
        <div className="app-container">
            {/* Conditionally render the sidebar */}
            {showSidebar && <Sidebar />}
            
            {/* Main content area */}
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