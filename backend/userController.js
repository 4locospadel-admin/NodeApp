const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { connectToDatabase } = require('./dbConnection');

// Create a new user
router.post('/users', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required.' });
    }

    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('Name', sql.NVarChar, name)
            .input('Email', sql.NVarChar, email)
            .query('INSERT INTO Users (Name, Email) VALUES (@Name, @Email); SELECT SCOPE_IDENTITY() AS Id;');

        res.status(201).json({ id: result.recordset[0].Id, name, email });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Retrieve all users
router.get('/users', async (req, res) => {
    try {
        const pool = await connectToDatabase();
        const result = await pool.request().query('SELECT * FROM Users;');
        res.status(200).json(result.recordset);
    } catch (err) {
        console.error('Error retrieving users:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Update an existing user
router.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required.' });
    }

    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .input('Name', sql.NVarChar, name)
            .input('Email', sql.NVarChar, email)
            .query('UPDATE Users SET Name = @Name, Email = @Email WHERE Id = @Id;');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User updated successfully.' });
    } catch (err) {
        console.error('Error updating user:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Delete a user
router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query('DELETE FROM Users WHERE Id = @Id;');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// Retrieve a single user by Id
router.get('/users/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const pool = await connectToDatabase();
        const result = await pool.request()
            .input('Id', sql.Int, id)
            .query('SELECT * FROM Users WHERE Id = @Id;');

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json(result.recordset[0]);
    } catch (err) {
        console.error('Error retrieving user:', err);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;