import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ResetPassword.css"

function ResetPassword() {
  const [Password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [ResetToken] = useState(new URLSearchParams(window.location.search).get("token"));
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!Password || Password !== confirmPassword) {
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
          type="Password"
          value={Password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div>
        <label>Confirm Password</label>
        <input
          type="Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
      </div>
      <button onClick={handleReset}>Reset Password</button>
    </div>
  );
}

export default ResetPassword;