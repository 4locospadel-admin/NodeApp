const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { connectToDatabase } = require('./dbConnection');

router.get('/inquiries', async (req, res) => {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().query('SELECT * FROM SupportInquiry;');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('Error fetching inquiries:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;