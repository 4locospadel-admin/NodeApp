import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <div className="home">
            <div className="button-container">
                <div>AAAAAAAAAAAAAAA</div>
                <img src="/logo.png" alt="Logo" className="logo" />
                <Link to="/database-test"><button className="button">DB Test</button></Link>
                <Link to="/contact"><button className="button">Contact Form</button></Link>
                <Link to="/about"><button className="button">About</button></Link>
            </div>
        </div>
    );
}

export default Home;