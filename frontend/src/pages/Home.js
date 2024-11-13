import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <div className="home">
            <div className="home-button-container">
                <img src="/logo.png" alt="Logo" className="logo" />
                <Link to="/database-test"><button className="home-button">DB Test</button></Link>
                <Link to="/contact"><button className="home-button">Contact Form</button></Link>
                <Link to="/about"><button className="home-button">About</button></Link>
            </div>
        </div>
    );
}

export default Home;