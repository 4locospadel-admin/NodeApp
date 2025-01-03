/**
 * @file ResetPassword.js
 * @description A React component for resetting a user's password using a token from the URL.
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css";

/**
 * Renders the "Reset Password" page.
 *
 * This component allows users to reset their password using a valid reset token. 
 * The token is retrieved from the URL query parameters.
 *
 * Features:
 * - Validates the new password (minimum length and confirmation match).
 * - Sends the password reset request to the server.
 * - Displays an error message for invalid or missing tokens.
 * - Redirects to the profile page upon successful reset.
 *
 * @component
 */
function ResetPassword() {
  const [Password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ResetToken] = useState(new URLSearchParams(window.location.search).get("token"));
  const navigate = useNavigate();

  /**
   * Handles the password reset process.
   *
   * Validates the password and confirmation, then sends the reset token and
   * new password to the server. Upon success, navigates to the profile page.
   *
   * @async
   * @function
   */
  const handleReset = async () => {
    if (!Password || Password.length < 5) {
      alert("Password must be at least 5 characters long.");
      return;
    }

    if (Password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/api/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ResetToken, Password }),
      });

      if (!response.ok) throw new Error(await response.text());

      alert("Password successfully reset.");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Error resetting Password.");
    }
  };

  if (!ResetToken) {
    return (
      <div className="reset-password-page">
        <h2>Invalid or Missing Token</h2>
        <p>Please check your email for the correct reset link or request a new one.</p>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <h2>Reset Your Password</h2>
      <div>
        <label>New Password</label>
        <input
          type="password"
          value={Password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label>Confirm Password</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <button onClick={handleReset}>Reset Password</button>
    </div>
  );
}

export default ResetPassword;