/**
 * @file inquiryController.js
 * @description Express router for managing support inquiries in the system.
 */

const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { connectToDatabase } = require("../dbConnection");

/**
 * @route GET /inquiries
 * @description Fetch all inquiries or filter inquiries by email.
 * @queryParam {string} [email] - The email address to filter inquiries (optional).
 * @returns {Object[]} 200 - Array of inquiry objects.
 * @returns {Object} 500 - Internal server error message.
 */
router.get("/inquiries", async (req, res) => {
  const { email } = req.query; // Extract email from query parameters
  if (!email) {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request().query("SELECT * FROM SupportInquiry");

      res.status(200).json(result.recordset);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Internal server error." });
    }
  } else {
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
  }
});

/**
 * @route POST /inquiries
 * @description Create a new support inquiry.
 * @bodyParam {string} Email - The email address of the user creating the inquiry.
 * @bodyParam {string} Category - The category of the inquiry (optional).
 * @bodyParam {string} Subject - The subject of the inquiry.
 * @bodyParam {string} Description - The description of the inquiry.
 * @bodyParam {boolean} Notification - Whether the user wants notifications about the inquiry.
 * @returns {Object} 201 - The created inquiry object.
 * @returns {Object} 400 - Bad request if required fields are missing.
 * @returns {Object} 500 - Internal server error message.
 */
router.post("/inquiries", async (req, res) => {
  const { Email, Category, Subject, Description, Notification } = req.body;

  if (!Email || !Subject || !Description) {
    return res
      .status(400)
      .json({ message: "Email, subject, and message are required." });
  }

  try {
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input("Email", sql.NVarChar, Email)
      .input("Category", sql.NVarChar, Category)
      .input("Subject", sql.NVarChar, Subject)
      .input("Description", sql.NVarChar, Description)
      .input("Notification", sql.Bit, Notification ? 1 : 0).query(`
        INSERT INTO SupportInquiry (Email, Category, Subject, Description, Notification, Created, Status)
        VALUES (@Email, @Category, @Subject, @Description, @Notification, GETDATE(), 'Open');
        SELECT SCOPE_IDENTITY() AS Id;
      `);

    const createdId = result.recordset[0].Id;
    res
      .status(201)
      .json({
        Id: createdId,
        Email,
        Category,
        Subject,
        Description,
        Notification,
      });
  } catch (err) {
    console.error("Error creating inquiry:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

/**
 * @route PUT /inquiries/:id
 * @description Update an existing inquiry's status or response.
 * @pathParam {number} id - The ID of the inquiry to update.
 * @bodyParam {string} [status] - The updated status of the inquiry (optional).
 * @bodyParam {string} [response] - The response to the inquiry (optional).
 * @returns {Object} 200 - Success message.
 * @returns {Object} 404 - Inquiry not found message.
 * @returns {Object} 500 - Internal server error message.
 */
router.put("/inquiries/:id", async (req, res) => {
  const { id } = req.params;
  const { status, response } = req.body;

  try {
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input("Id", sql.Int, id)
      .input("Status", sql.NVarChar, status || null)
      .input("Response", sql.NVarChar, response || null).query(`
        UPDATE SupportInquiry
        SET Status = ISNULL(@Status, Status),
            Answer = ISNULL(@Response, Answer),
            UpdatedDate = GETDATE()
        WHERE Id = @Id;
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Inquiry not found." });
    }

    res.status(200).json({ message: "Inquiry updated successfully." });
  } catch (err) {
    console.error("Error updating inquiry:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

module.exports = router;
