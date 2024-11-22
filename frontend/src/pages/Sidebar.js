import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaEnvelope, FaInfoCircle, FaCalendar, FaUser } from 'react-icons/fa';
import './Sidebar.css'; // Ensure this path is correct

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