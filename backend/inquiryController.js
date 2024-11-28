const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { connectToDatabase } = require('./dbConnection');

router.get("/inquiries", async (req, res) => {
  const { email } = req.query; // Extract email from query parameters
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM SupportInquiry WHERE Email = @Email");

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error fetching inquiries:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Create a new inquiry
router.post('/inquiries', async (req, res) => {
  const { Email, Category, Subject, Description, Notification } = req.body;

  if (!Email || !Subject || !Description) {
    return res.status(400).json({ message: 'Email, subject, and message are required.' });
  }

  try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('Email', sql.NVarChar, Email)
      .input('Category', sql.NVarChar, Category)
      .input('Subject', sql.NVarChar, Subject)
      .input('Description', sql.NVarChar, Description)
      .input('Notification', sql.Bit, Notification ? 1 : 0)
      .query(`
        INSERT INTO SupportInquiry (Email, Category, Subject, Description, Notification, Created, Status)
        VALUES (@Email, @Category, @Subject, @Description, @Notification, GETDATE(), 'Open');
        SELECT SCOPE_IDENTITY() AS Id;
      `);

    const createdId = result.recordset[0].Id;
    res.status(201).json({ Id: createdId, Email, Category, Subject, Description, Notification });
  } catch (err) {
    console.error('Error creating inquiry:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

// Update inquiry status or response (optional, example functionality)
router.put('/inquiries/:id', async (req, res) => {
  const { id } = req.params;
  const { status, response } = req.body;

  try {
    const pool = await connectToDatabase();
    const result = await pool.request()
      .input('Id', sql.Int, id)
      .input('Status', sql.NVarChar, status || null)
      .input('Response', sql.NVarChar, response || null)
      .query(`
        UPDATE SupportInquiry
        SET Status = ISNULL(@Status, Status),
            Answer = ISNULL(@Response, Answer),
            UpdatedDate = GETDATE()
        WHERE Id = @Id;
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Inquiry not found.' });
    }

    res.status(200).json({ message: 'Inquiry updated successfully.' });
  } catch (err) {
    console.error('Error updating inquiry:', err);
    res.status(500).json({ message: 'Internal server error.' });
  }
});

module.exports = router;