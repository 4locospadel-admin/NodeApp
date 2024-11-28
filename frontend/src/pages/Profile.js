import React, { useState, useEffect } from "react";
import "./Profile.css";

function Profile() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and sign-up
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [Name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    // Fetch user data from local storage or backend
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setLoggedInUser(user);
      setName(user.Name); // Pre-fill the Name field
    }
  }, []);

  const handleToggle = () => setIsLogin(!isLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Email || !Password || (!isLogin && !Name)) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch(`/api/${isLogin ? "login" : "signup"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Name, Email, Password }),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setLoggedInUser(data);
      setName(data.Name); // Set the user's Name
      localStorage.setItem("user", JSON.stringify(data)); // Store user info locally
      localStorage.setItem("token", data.token); // Store JWT for later use
      alert(`${isLogin ? "Logged in" : "Signed up"} successfully!`);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  /*
  const handleSaveChanges = async () => {
    if (newPassword && newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          Name: Name !== loggedInUser.Name ? Name : undefined,
          newPassword: newPassword || undefined,
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      const data = await response.json();
      setLoggedInUser((prev) => ({ ...prev, Name: data.Name }));
      localStorage.setItem("user", JSON.stringify({ ...loggedInUser, Name: data.Name }));
      setNewPassword("");
      setConfirmPassword("");
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  */

  const handlePasswordReset = async () => {
    if (!Email) {
      alert("Please enter your email to reset the password.");
      return;
    }

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email }),
      });

      if (!response.ok) throw new Error(await response.text());

      alert("A password reset link has been sent to your email.");
    } catch (err) {
      console.error(err);
      alert("Error sending password reset email.");
    }
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setName("");
    setEmail("");
    setPassword("");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    alert("Logged out successfully!");
  };

  return (
    <div className="profile-page">
      {!loggedInUser ? (
        <>
          <h2>{isLogin ? "Log In" : "Sign Up"}</h2>
          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div>
                <label>Name</label>
                <input
                  type="text"
                  value={Name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  required={!isLogin}
                />
              </div>
            )}
            <div>
              <label>Email</label>
              <input
                type="email"
                value={Email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email"
                required
              />
            </div>
            <div>
              <label>Password</label>
              <input
                type="password"
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your Password"
                required
                minLength="5"
              />
            </div>
            <button type="submit">{isLogin ? "Log In" : "Sign Up"}</button>
          </form>
          <div className="auth-buttons">
            <button onClick={handleToggle} className="toggle-button">
              {isLogin ? "Create an account" : "Already have an account? Log In"}
            </button>
            {isLogin && (
              <button onClick={handlePasswordReset} className="reset-button">
                Forgot Password?
              </button>
            )}
          </div>
        </>
      ) : (
        <>
          <h2>Profile</h2>
          <div className="profile-details">
            <p>
              <strong>Email:</strong> {loggedInUser.Email}
            </p>
            <div>
              <label>Name:</label>
              <input
                type="text"
                value={Name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label>NEW Password:</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
              />
            </div>
            <div>
              <label>CONFIRM Password:</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
              />
            </div>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;