/**
 * @file Home.js
 * @description A React component for the home page that provides navigation to key sections of the application.
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

/**
 * Renders the home page of the application.
 *
 * The home page includes:
 * - A logo representing the application or organization.
 * - Navigation buttons that redirect to various sections of the app (Profile, Reservation, Contact Form, About).
 *
 * @component
 */
function Home() {
  const navigate = useNavigate();

  /**
   * Redirects the user to the specified path.
   *
   * @param {string} path - The path to navigate to.
   */
  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="home">
      <div className="home-button-container">
        <img src="/4locos_logo.png" alt="Logo" className="logo" />
        <button
          className="home-button"
          onClick={() => handleNavigation("/profile")}
        >
          Profile
        </button>
        <button
          className="home-button"
          onClick={() => handleNavigation("/reservation")}
        >
          Reservation
        </button>
        <button
          className="home-button"
          onClick={() => handleNavigation("/contact")}
        >
          Contact Form
        </button>
        <button
          className="home-button"
          onClick={() => handleNavigation("/about")}
        >
          About
        </button>
      </div>
    </div>
  );
}

export default Home;
