import React, { useState } from "react";

function DatabaseTest() {
  // State to manage the visibility of the form
  const [showForm, setShowForm] = useState(false);
  // State to manage form inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // State to manage the list of users
  const [users, setUsers] = useState([]);

  // Function to handle saving a new user
  const handleSave = () => {
    if (name && email) {
      // Create a new user object and add it to the list
      const newUser = { name, email };
      setUsers([...users, newUser]);

      // Clear the form fields
      setName("");
      setEmail("");
    }
  };

  return (
    <div className="page">
      <h2>Database Test Page</h2>

      {/* Button to toggle the form */}
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Close" : "Create User"}
      </button>

      {/* Conditional rendering for the form */}
      {showForm && (
        <div className="form">
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setShowForm(false)}>Close</button>
        </div>
      )}

      {/* Display the list of users */}
      <div className="user-list">
        <h3>User List</h3>
        {users.length > 0 ? (
          <ul>
            {users.map((user, index) => (
              <li key={index}>
                {user.name} - {user.email}
              </li>
            ))}
          </ul>
        ) : (
          <p>No users yet</p>
        )}
      </div>
    </div>
  );
}

export default DatabaseTest;
