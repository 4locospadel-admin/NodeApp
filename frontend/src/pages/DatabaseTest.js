import React, { useState, useEffect } from "react";
import './DatabaseTest.css';

function DatabaseTest() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingUser, setEditingUser] = useState({ Id: null, Name: "", Email: "" });

  // Fetch users from the backend API
  useEffect(() => {
    fetch('/api/users')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.clone().json();
      })
      .then(data => {
        setUsers(data)
      })
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const handleSave = () => {
    if (name && email) {
      const newUser = { name, email };
      fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      })
        .then(response => response.json())
        .then(data => {
          setUsers([...users, data]);
          setName("");
          setEmail("");
          setShowForm(false);
        })
        .catch(error => console.error('Error creating user:', error));
    } else {
      alert("Please enter both name and email.");
    }
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditingUser(users[index]);
  };

  const handleUpdate = () => {
    const { Id, Name, Email } = editingUser;
    if (Name && Email) {
      fetch(`/api/users/${Id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Name, Email }),
      })
        .then(response => {
          if (response.ok) {
            const updatedUsers = users.map(user =>
              user.Id === Id ? { ...user, Name, Email } : user
            );
            setUsers(updatedUsers);
            setEditingIndex(null);
            setEditingUser({ Id: null, Name: "", Email: "" });
          } else {
            alert('Error updating user.');
          }
        })
        .catch(error => console.error('Error updating user:', error));
    } else {
      alert("Please enter both name and email.");
    }
  };

  const handleDelete = (Id) => {
    fetch(`/api/users/${Id}`, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          const updatedUsers = users.filter(user => user.Id !== Id);
          setUsers(updatedUsers);
        } else {
          alert('Error deleting user.');
        }
      })
      .catch(error => console.error('Error deleting user:', error));
  };

  const handleInputChange = (field, value) => {
    setEditingUser({ ...editingUser, [field]: value });
  };

  return (
    <div className="page">
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Close" : "Create User"}
      </button>
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
      <div className="user-list">
        <h3>User List</h3>
        {users.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.Id}>
                  <td>{user.Id}</td>
                  <td>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editingUser.Name}
                        onChange={(e) => handleInputChange("Name", e.target.value)}
                      />
                    ) : (
                      user.Name
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <input
                        type="email"
                        value={editingUser.Email}
                        onChange={(e) => handleInputChange("Email", e.target.value)}
                      />
                    ) : (
                      user.Email
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <button onClick={handleUpdate}>Save</button>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(index)}>Edit</button>
                        <button onClick={() => handleDelete(user.Id)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No users yet</p>
        )}
      </div>
    </div>
  );
}

export default DatabaseTest;