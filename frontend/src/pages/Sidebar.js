/**
 * @file Sidebar.js
 * @description A React component for rendering a navigation sidebar with icons and links to key pages.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaEnvelope, FaInfoCircle, FaCalendar, FaUser } from 'react-icons/fa';
import './Sidebar.css';

/**
 * Renders the "Sidebar" navigation menu.
 * 
 * The sidebar provides quick access to the following sections:
 * - Home
 * - Profile
 * - Reservation
 * - Contact
 * - About
 * 
 * Each navigation item is represented by an icon and links to the corresponding page.
 *
 * @component
 * @example
 * // Usage in a React app
 * import Sidebar from './Sidebar';
 * 
 * function App() {
 *   return (
 *     <div>
 *       <Sidebar />
 *     </div>
 *   );
 * }
 * 
 * export default App;
 */
function Sidebar() {
    return (
        <div className="sidebar">
            <ul className="sidebar-links">
                <li>
                    <Link to="/">
                        <FaHome className="icon" />
                    </Link>
                </li>
                <li>
                    <Link to="/profile">
                        <FaUser className="icon" />
                    </Link>
                </li>
                <li>
                    <Link to="/reservation">
                        <FaCalendar className="icon" />
                    </Link>
                </li>
                <li>
                    <Link to="/contact">
                        <FaEnvelope className="icon" />
                    </Link>
                </li>
                <li>
                    <Link to="/about">
                        <FaInfoCircle className="icon" />
                    </Link>
                </li>
            </ul>
        </div>
    );
}

export default Sidebar;