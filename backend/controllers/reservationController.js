/**
 * @file reservationController.js
 * @description Express router for managing padel court reservations and courts.
 */

const express = require("express");
const sql = require("mssql");
const { connectToDatabase } = require("../dbConnection");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

/**
 * Email transporter for sending notifications.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Formats a date to "dd/MM/yyyy".
 * @param {Date} date - The date to format.
 * @returns {string} Formatted date string.
 */
const formatDate = (date) => new Date(date).toLocaleDateString("en-GB");

/**
 * Formats a time string to "HH:mm".
 * @param {string} timeString - The time string to format.
 * @returns {string} Formatted time string.
 */
const formatTime = (timeString) => {
  try {
    const date = new Date(timeString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    });
  } catch (error) {
    console.error("Invalid time format:", timeString);
    return "Invalid Time";
  }
};

/**
 * Generates an iCalendar event string for a reservation.
 * @param {Object} reservation - The reservation details.
 * @param {string} reservation.date - The reservation date (dd/MM/yyyy).
 * @param {string} reservation.startTime - The start time of the reservation.
 * @param {string} reservation.endTime - The end time of the reservation.
 * @param {string} reservation.court - The name of the court.
 * @returns {string} iCalendar event string.
 */
const generateCalendarEvent = (reservation) => {
  try {
    // Ensure the inputs are defined
    if (!reservation.date || !reservation.startTime || !reservation.endTime) {
      throw new Error("Missing required fields: date, startTime, or endTime");
    }

    const [day, month, year] = reservation.date.split("/");
    const normalizedDate = `${year}-${month}-${day}`;

    const start = new Date(`${normalizedDate}T${reservation.startTime}`);
    const end = new Date(`${normalizedDate}T${reservation.endTime}`);

    // Check if the constructed dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Invalid start or end time for calendar event.");
    }

    // Format the start and end times for the calendar event
    const formattedStart = start.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const formattedEnd = end.toISOString().replace(/-|:|\.\d\d\d/g, "");

    return `BEGIN:VCALENDAR
                VERSION:2.0
                BEGIN:VEVENT
                UID:${uuidv4()}
                SUMMARY:Padel Court Reservation
                DESCRIPTION:Reservation for ${reservation.court}
                DTSTART:${formattedStart}
                DTEND:${formattedEnd}
                LOCATION:4Locos Padel
                END:VEVENT
                END:VCALENDAR`;
  } catch (error) {
    console.error("Error generating calendar event:", error.message);
    throw error; // Re-throw the error to handle it upstream
  }
};

/**
 * @route POST /reservations
 * @description Creates a new reservation and sends a confirmation email.
 * @bodyParam {string} court - The court identifier.
 * @bodyParam {string} email - The user's email address.
 * @bodyParam {string} name - The name of the user.
 * @bodyParam {string} date - The reservation date (dd/MM/yyyy).
 * @bodyParam {string} startTime - The start time of the reservation (HH:mm).
 * @bodyParam {string} endTime - The end time of the reservation (HH:mm).
 * @returns {Object} 201 - The reservation ID on success.
 * @returns {string} 400 - Validation error message.
 * @returns {string} 500 - Internal server error message.
 */
router.post("/reservations", async (req, res) => {
  const { court, email, name, date, startTime, endTime } = req.body;

  if (!court || !email || !name || !date || !startTime || !endTime) {
    return res.status(400).send("All fields are required.");
  }

  try {
    const [day, month, year] = date.split("/");
    const reservationDate = new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day), 0, 0, 0)
    );

    const sqlStartTime = startTime + ":00";
    const sqlEndTime = endTime + ":00";

    const pool = await connectToDatabase();

    // Validate court
    const courtQuery = await pool
      .request()
      .input("CourtID", sql.NVarChar, court)
      .query("SELECT CourtID FROM Court WHERE CourtID = @CourtID");

    const courtID = courtQuery.recordset[0]?.CourtID;
    if (!courtID) return res.status(400).send("Invalid court.");

    // Insert reservation
    const reservationResult = await pool
      .request()
      .input("CourtID", sql.Int, courtID)
      .input("Name", sql.NVarChar, name)
      .input("Email", sql.NVarChar, email)
      .input("Date", sql.Date, reservationDate)
      .input("StartTime", sql.NVarChar, sqlStartTime)
      .input("EndTime", sql.NVarChar, sqlEndTime)
      .input("Status", sql.NVarChar, "Created").query(`
                INSERT INTO Reservation (CourtID, Name, Email, Date, StartTime, EndTime, Status)
                OUTPUT INSERTED.ReservationID
                VALUES (@CourtID, @Name, @Email, @Date, @StartTime, @EndTime, @Status)
            `);

    const reservationID = reservationResult.recordset[0].ReservationID;

    // Send confirmation email
    const calendarEvent = generateCalendarEvent({
      court,
      date,
      startTime,
      endTime,
    });
    await transporter.sendMail({
      from: `"4Locos Padel" <${process.env.EMAIL}>`,
      to: email,
      subject: "Reservation Created",
      text: `Your reservation for ${court} on ${date} from ${startTime} to ${endTime} has been created.`,
      icalEvent: {
        content: calendarEvent,
        method: "REQUEST",
      },
    });

    res.status(201).json({ reservationID });
  } catch (err) {
    console.error("Error creating reservation:", err);
    res.status(500).send("Error creating reservation.");
  }
});

/**
 * @route PUT /reservations/:id/cancel
 * @description Cancels an existing reservation and sends a notification email.
 * @pathParam {number} id - The reservation ID.
 * @bodyParam {string} CancellationReason - The reason for cancelling the reservation.
 * @returns {string} 200 - Success message.
 * @returns {string} 400 - Validation error message.
 * @returns {string} 404 - Not found error message.
 * @returns {string} 500 - Internal server error message.
 */
router.put("/reservations/:id/cancel", async (req, res) => {
  const { id } = req.params;
  const { CancellationReason } = req.body;

  if (!CancellationReason) {
    return res.status(400).send("Cancellation reason is required.");
  }

  try {
    const pool = await connectToDatabase();

    // Fetch reservation details, including CourtName
    const reservationQuery = await pool
      .request()
      .input("ReservationID", sql.Int, id).query(`
                SELECT r.*, c.CourtName
                FROM Reservation r
                JOIN Court c ON r.CourtID = c.CourtID
                WHERE r.ReservationID = @ReservationID
            `);

    if (reservationQuery.recordset.length === 0) {
      return res.status(404).send("Reservation not found.");
    }

    const reservation = reservationQuery.recordset[0];

    // Update reservation status to "Cancelled"
    await pool
      .request()
      .input("ReservationID", sql.Int, id)
      .input("CancellationReason", sql.NVarChar, CancellationReason)
      .input("Status", sql.NVarChar, "Cancelled").query(`
                UPDATE Reservation
                SET Status = @Status, CancellationReason = @CancellationReason
                WHERE ReservationID = @ReservationID
            `);

    // Send notification email with formatted dates and times
    await transporter.sendMail({
      from: `"4Locos Padel" <${process.env.EMAIL}>`,
      to: reservation.Email,
      subject: "Reservation Cancelled",
      text: `Your reservation for ${reservation.CourtName} on ${formatDate(
        reservation.Date
      )} from ${formatTime(reservation.StartTime)} to ${formatTime(
        reservation.EndTime
      )} has been cancelled.\nReason: ${CancellationReason}`,
    });

    res.status(200).send("Reservation cancelled successfully.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error cancelling reservation.");
  }
});

/**
 * @route GET /reservations
 * @description Fetches reservations for a specific user.
 * @queryParam {string} email - The user's email address.
 * @returns {Object[]} 200 - Array of reservation objects.
 * @returns {string} 400 - Validation error message.
 * @returns {string} 500 - Internal server error message.
 */
router.get("/reservations", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send("Email is required.");
  }

  try {
    const pool = await connectToDatabase();

    const queryResult = await pool.request().input("Email", sql.NVarChar, email)
      .query(`
                SELECT 
                    R.ReservationID, R.Name, R.Email, R.Date, R.StartTime, R.EndTime, 
                    R.Status, R.CancellationReason, C.CourtName, C.CourtID,
                    DATEDIFF(MINUTE, R.StartTime, R.EndTime) / 60.0 AS Duration
                FROM Reservation R
                INNER JOIN Court C ON R.CourtID = C.CourtID
                WHERE R.Email = @Email
                ORDER BY R.Date, R.StartTime
            `);

    res.status(200).json(queryResult.recordset);
  } catch (error) {
    console.error("Error fetching reservations:", error);
    res.status(500).send("Internal server error.");
  }
});

/**
 * @route GET /reservations/day
 * @description Fetches all reservations for a specific day.
 * @queryParam {string} date - The date to fetch reservations for (yyyy-MM-dd).
 * @returns {Object[]} 200 - Array of reservation objects.
 * @returns {string} 400 - Validation error message.
 * @returns {string} 500 - Internal server error message.
 */
router.get("/reservations/day", async (req, res) => {
  const { date } = req.query;

  if (!date) {
    return res.status(400).send("Date is required.");
  }

  try {
    const pool = await connectToDatabase();

    const queryResult = await pool.request().input("Date", sql.Date, date)
      .query(`
                SELECT R.ReservationID, R.Name, R.Email, R.Date, R.StartTime, R.EndTime, 
                        R.Status, R.CancellationReason, C.CourtName, R.CourtID
                FROM Reservation R
                INNER JOIN Court C ON R.CourtID = C.CourtID
                WHERE R.Date = @Date
            `);

    res.status(200).json(queryResult.recordset);
  } catch (error) {
    console.error("Error fetching reservations for the day:", error);
    res.status(500).send("Internal server error.");
  }
});

/**
 * @route GET /courts
 * @description Fetches all courts available for reservations.
 * @returns {Object[]} 200 - Array of court objects.
 * @returns {string} 500 - Internal server error message.
 */
router.get("/courts", async (req, res) => {
  try {
    const pool = await connectToDatabase();

    const queryResult = await pool.request().query(`
            SELECT CourtID, CourtName 
            FROM Court
            ORDER BY CourtID
        `);

    return res.status(200).json(queryResult.recordset);
  } catch (error) {
    console.error("Error fetching courts:", error);
    return res.status(500).send("Internal server error.");
  }
});

module.exports = router;
