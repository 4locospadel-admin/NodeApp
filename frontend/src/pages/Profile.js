import React, { useState, useEffect } from "react";
import "./Profile.css";

function Profile() {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and sign-up
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [Name, setName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setEmail(email);
    setIsEmailValid(isValidEmail(email));
  };


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setLoggedInUser(user);
      setName(user.Name);
      setEmail(user.Email);
    }
  }, []);

  const handleToggle = () => setIsLogin(!isLogin);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
    if (isEditing) {
      setNewPassword("");
      setNewConfirmPassword("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(Email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (!Email || !Password || (!isLogin && !Name)) {
      alert("Please fill out all fields.");
      return;
    }

    if (!isLogin && Password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (Password.length < 5) {
      alert("Password must be at least 5 characters long.");
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
      // Save token and user info immediately after sign-up
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("token", data.token);
      setLoggedInUser(data);
      setName(data.Name);
      setEmail(data.Email);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  const handleSaveChanges = async () => {
    if (newPassword && newPassword !== newConfirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (newPassword && newPassword.length < 5) {
      alert("Password must be at least 5 characters long.");
      return;
    }
    console.log("user:", loggedInUser);

    const token = localStorage.getItem("token");
    console.log("token:", token, "name", Name, "pass", newPassword);
    if (!token) {
      alert("You must be logged in to update your profile.");
      return;
    }

    try {
      const trimmedName = Name.trim();
      const trimmedPassword = newPassword?.trim();

      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Name: trimmedName !== loggedInUser.Name ? trimmedName : undefined,
          newPassword: trimmedPassword || undefined,
        }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        alert(`Error: ${response.status} - ${errorMessage}`);
        return;
      }

      const data = await response.json();
      setLoggedInUser((prev) => ({ ...prev, Name: data.Name }));
      localStorage.setItem("user", JSON.stringify({ ...loggedInUser, Name: data.Name }));
      setNewPassword("");
      setNewConfirmPassword("");
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      alert("An error occurred while updating your profile. Please try again.");
    }
  };

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
                onChange={handleEmailChange}
                placeholder="Your Email"
                required
              />
              {!isEmailValid && <small className="error-text">Invalid email format.</small>}
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
              <small>Password must be at least 5 characters long.</small>
            </div>
            {!isLogin && (
              <div>
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm Your Password"
                  required
                />
              </div>
            )}
            <button type="submit" disabled={!isEmailValid}>
              {isLogin ? "Log In" : "Sign Up"}
            </button>
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
                disabled={!isEditing} // Disable the Name field unless editing
              />
            </div>
            {isEditing && (
              <>
                <div>
                  <label>New Password:</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                  />
                  <small>Password must be at least 5 characters long.</small>
                </div>
                <div>
                  <label>Confirm New Password:</label>
                  <input
                    type="password"
                    value={newConfirmPassword}
                    onChange={(e) => setNewConfirmPassword(e.target.value)}
                    placeholder="Confirm New Password"
                  />
                </div>
              </>
            )}
            <button onClick={isEditing ? handleSaveChanges : toggleEdit} className="save-changes-button">
              {isEditing ? "Save Changes" : "Edit"}
            </button>
            {isEditing && (
              <button onClick={toggleEdit} className="cancel-button">
                Cancel
              </button>
            )}
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