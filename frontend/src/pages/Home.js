import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <img src="logo.png" alt="Logo" className="logo" />
      <h1>Welcome to the Padel Courts App</h1>
      <div className="button-container">
        <Link to="/dbtest">
          <button className="button">Database Test</button>
        </Link>
        <Link to="/about">
          <button className="button">About</button>
        </Link>
      </div>
    </div>
  );
}

export default Home;
