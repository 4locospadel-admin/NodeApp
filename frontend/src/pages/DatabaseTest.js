import React, { useState, useEffect } from "react";
import './DatabaseTest.css';

function DatabaseTest() {
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [users, setUsers] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingUser, setEditingUser] = useState({ id: null, name: "", email: "" });

  // Fetch users from the backend API
  useEffect(() => {
    fetch('/users')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.clone().json();
      })
      .then(data => setUsers(data))
      .catch(error => console.error('Error fetching users:', error));
  }, []);

  const handleSave = () => {
    if (name && email) {
      const newUser = { name, email };
      fetch('/users', {
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
    const { id, name, email } = editingUser;
    if (name && email) {
      fetch(`/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      })
        .then(response => {
          if (response.ok) {
            const updatedUsers = users.map(user =>
              user.id === id ? { ...user, name, email } : user
            );
            setUsers(updatedUsers);
            setEditingIndex(null);
            setEditingUser({ id: null, name: "", email: "" });
          } else {
            alert('Error updating user.');
          }
        })
        .catch(error => console.error('Error updating user:', error));
    } else {
      alert("Please enter both name and email.");
    }
  };

  const handleDelete = (id) => {
    fetch(`/users/${id}`, { method: 'DELETE' })
      .then(response => {
        if (response.ok) {
          const updatedUsers = users.filter(user => user.id !== id);
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
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editingUser.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                      />
                    ) : (
                      user.name
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    ) : (
                      user.email
                    )}
                  </td>
                  <td>
                    {editingIndex === index ? (
                      <button onClick={handleUpdate}>Save</button>
                    ) : (
                      <>
                        <button onClick={() => handleEdit(index)}>Edit</button>
                        <button onClick={() => handleDelete(user.id)}>Delete</button>
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