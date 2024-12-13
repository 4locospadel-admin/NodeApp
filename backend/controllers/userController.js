/**
 * @file userController.js
 * @description Routes for user authentication, password management, and profile updates.
 */
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const nodemailer = require("nodemailer");
const { connectToDatabase } = require("../dbConnection");

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

/**
 * @route POST /signup
 * @description Registers a new user.
 * @bodyParam {string} Name - The user's full name.
 * @bodyParam {string} Email - The user's email address.
 * @bodyParam {string} Password - The user's password.
 * @returns {Object} 201 - Success message with a JWT token.
 * @returns {string} 400 - Validation error message.
 * @returns {string} 500 - Internal server error message.
 */
router.post("/signup", async (req, res) => {
  const { Name, Email, Password } = req.body;
  if (!Name || !Email || !Password) return res.status(400).send("All fields are required.");

  try {
    const pool = await connectToDatabase();

    // Check if Email exists
    const existingUser = await pool
      .request()
      .input("Email", sql.NVarChar, Email)
      .query("SELECT * FROM [User] WHERE Email = @Email");

    if (existingUser.recordset.length > 0) return res.status(400).send("Email already exists.");

    // Hash Password and insert user
    const hashedPassword = await bcrypt.hash(Password, 10);
    await pool
      .request()
      .input("Name", sql.NVarChar, Name)
      .input("Email", sql.NVarChar, Email)
      .input("Password", sql.NVarChar, hashedPassword)
      .query("INSERT INTO [User] (Name, Email, Password) VALUES (@Name, @Email, @Password)");

    // Generate a token after successful sign-up
    const token = jwt.sign({ Email }, SECRET, { expiresIn: "1h" });

    res.status(201).json({ message: "User registered successfully.", token, Email, Name });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error.");
  }
});

/**
 * @route POST /login
 * @description Authenticates a user and returns a JWT token.
 * @bodyParam {string} Email - The user's email address.
 * @bodyParam {string} Password - The user's password.
 * @returns {Object} 200 - Success message with a JWT token.
 * @returns {string} 400 - Invalid credentials or validation error message.
 * @returns {string} 500 - Internal server error message.
 */
router.post("/login", async (req, res) => {
  const { Email, Password } = req.body;

  try {
    const pool = await connectToDatabase();

    // Check if user exists
    const user = await pool
      .request()
      .input("Email", sql.NVarChar, Email)
      .query("SELECT * FROM [User] WHERE Email = @Email");

    if (user.recordset.length === 0) return res.status(400).send("Invalid credentials.");

    // Verify Password
    const isValid = await bcrypt.compare(Password, user.recordset[0].Password);
    if (!isValid) return res.status(400).send("Invalid credentials.");

    // Create JWT
    const token = jwt.sign({ Email, role: user.recordset[0].Role || "user" }, SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token, Email, Name: user.recordset[0].Name, Role: user.recordset[0].Role });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error.");
  }
});

/**
 * @route POST /reset-password
 * @description Initiates a password reset process by generating and sending a reset token.
 * @bodyParam {string} Email - The user's email address.
 * @returns {string} 200 - Password reset email sent.
 * @returns {string} 400 - Validation error message.
 * @returns {string} 404 - User not found message.
 * @returns {string} 500 - Internal server error message.
 */
router.put("/reset-password", async (req, res) => {
  const { ResetToken, Password } = req.body;

  if (!ResetToken || !Password) {
    return res.status(400).send("Token and password are required.");
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(ResetToken, process.env.JWT_SECRET);
    const email = decoded.email; // Extract email from token payload

    // Connect to the database
    const pool = await connectToDatabase();

    // Check if the user exists
    const userQuery = await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .query("SELECT * FROM [User] WHERE Email = @Email");

    if (userQuery.recordset.length === 0) {
      return res.status(404).send("User not found.");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Update the password and clear the reset token
    await pool
      .request()
      .input("Email", sql.NVarChar, email)
      .input("Password", sql.NVarChar, hashedPassword)
      .query(
        "UPDATE [User] SET Password = @Password, ResetToken = NULL, TokenExpiration = NULL WHERE Email = @Email"
      );

    res.status(200).send("Password updated successfully.");
  } catch (err) {
    console.error("Error:", err);

    if (err.name === "JsonWebTokenError") {
      return res.status(400).send("Invalid token.");
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Token has expired. Please request a new reset link.");
    }

    res.status(500).send("Internal server error.");
  }
});

/**
 * @route POST /reset-password
 * @description Initiates a password reset process by generating and sending a reset token.
 * @bodyParam {string} Email - The user's email address.
 * @returns {string} 200 - Password reset email sent.
 * @returns {string} 400 - Validation error message.
 * @returns {string} 404 - User not found message.
 * @returns {string} 500 - Internal server error message.
 */
router.post("/reset-password", async (req, res) => {
  const { Email } = req.body;

  if (!Email) return res.status(400).send("Email is required.");

  try {
    const pool = await connectToDatabase();

    // Check if user exists
    const userQuery = await pool
      .request()
      .input("Email", sql.NVarChar, Email)
      .query("SELECT * FROM [User] WHERE Email = @Email");

    if (userQuery.recordset.length === 0) {
      return res.status(404).send("No account with this email exists.");
    }

    // Generate a JWT reset token
    const ResetToken = jwt.sign({ email: Email }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    // Save token and expiration time in the database
    const tokenExpiration = new Date(Date.now() + 3600000); // 1 hour from now
    await pool
      .request()
      .input("Email", sql.NVarChar, Email)
      .input("ResetToken", sql.NVarChar, ResetToken)
      .input("TokenExpiration", sql.DateTime, tokenExpiration)
      .query(
        "UPDATE [User] SET ResetToken = @ResetToken, TokenExpiration = @TokenExpiration WHERE Email = @Email"
      );

    // Send reset email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const resetLink = `http://4locospadel.azurewebsites.net/reset-password?token=${ResetToken}`;

    await transporter.sendMail({
      from: `"4Locos Padel" <${process.env.EMAIL}>`,
      to: Email,
      subject: "Password Reset Request",
      text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
    });

    res.status(200).send("Password reset email sent.");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Internal server error.");
  }
});

/**
 * @route PUT /user/update
 * @description Updates the user's profile information, such as name or password.
 * @bodyParam {string} [Name] - The new name for the user (optional).
 * @bodyParam {string} [newPassword] - The new password for the user (optional).
 * @headerParam {string} Authorization - Bearer token for authentication.
 * @returns {Object} 200 - Updated user profile data.
 * @returns {string} 400 - Validation error or no updates provided.
 * @returns {string} 401 - Unauthorized or token expired message.
 * @returns {string} 404 - User not found message.
 * @returns {string} 500 - Internal server error message.
 */
router.put("/user/update", async (req, res) => {
  const { Name, newPassword } = req.body;

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized.");
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    const Email = decoded.Email;

    const pool = await connectToDatabase();

    // Check if user exists
    const userQuery = await pool
      .request()
      .input("Email", sql.NVarChar, Email)
      .query("SELECT * FROM [User] WHERE Email = @Email");

    if (userQuery.recordset.length === 0) {
      return res.status(404).send("User not found.");
    }

    // Update the user's name and/or password
    if (Name || newPassword) {
      const hashedPassword = newPassword
        ? await bcrypt.hash(newPassword, 10)
        : null;

      await pool
        .request()
        .input("Email", sql.NVarChar, Email)
        .input("Name", sql.NVarChar, Name || userQuery.recordset[0].Name)
        .input("Password", sql.NVarChar, hashedPassword)
        .query(
          "UPDATE [User] SET Name = @Name" +
          (newPassword ? ", Password = @Password" : "") +
          " WHERE Email = @Email"
        );

      return res.status(200).json({ Name: Name || userQuery.recordset[0].Name });
    }

    res.status(400).send("No updates were provided.");
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(400).send("Invalid token.");
    }
    if (err.name === "TokenExpiredError") {
      return res.status(401).send("Token expired. Please log in again.");
    }
    res.status(500).send("Internal server error.");
  }
});

module.exports = router;