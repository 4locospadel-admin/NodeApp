import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
    const navigate = useNavigate();

    // Handler to redirect
    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div className="home">
            <div className="home-button-container">
                <img src="/4locos_logo.png" alt="Logo" className="logo" />
                <button
                    className="home-button"
                    onClick={() => handleNavigation('/profile')}
                >
                    Profile
                </button>
                <button
                    className="home-button"
                    onClick={() => handleNavigation('/reservation')}
                >
                    Reservation
                </button>
                <button
                    className="home-button"
                    onClick={() => handleNavigation('/contact')}
                >
                    Contact Form
                </button>
                <button
                    className="home-button"
                    onClick={() => handleNavigation('/about')}
                >
                    About
                </button>
            </div>
        </div>
    );
}

export default Home;