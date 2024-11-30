const express = require("express");
const sql = require("mssql");
const { connectToDatabase } = require('./dbConnection');
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

// Email configuration
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Helper: Generate calendar event
const generateCalendarEvent = (reservation) => {
    const start = new Date(reservation.date + "T" + reservation.startTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
    const end = new Date(reservation.date + "T" + reservation.endTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${uuidv4()}
SUMMARY:Padel Court Reservation
DESCRIPTION:Reservation for ${reservation.court}
DTSTART:${start}
DTEND:${end}
LOCATION:4Locos Padel
END:VEVENT
END:VCALENDAR`;
};

// Create reservation
router.post("/reservations", async (req, res) => {
    const { court, email, name, date, startTime, endTime } = req.body;

    if (!court || !email || !name || !date || !startTime || !endTime) {
        return res.status(400).send("All fields are required.");
    }

    try {
        const pool = await connectToDatabase();

        const courtQuery = await pool.request()
            .input("CourtName", sql.NVarChar, court)
            .query("SELECT CourtID FROM Courts WHERE CourtName = @CourtName");

        const courtID = courtQuery.recordset[0]?.CourtID;

        if (!courtID) return res.status(400).send("Invalid court.");

        const reservationResult = await pool.request()
            .input("CourtID", sql.Int, courtID)
            .input("Name", sql.NVarChar, name)
            .input("Email", sql.NVarChar, email)
            .input("Date", sql.Date, date)
            .input("StartTime", sql.Time, startTime)
            .input("EndTime", sql.Time, endTime)
            .input("Status", sql.NVarChar, "Created")
            .query(`
                INSERT INTO Reservation (CourtID, Name, Email, Date, StartTime, EndTime, Status)
                OUTPUT INSERTED.ReservationID
                VALUES (@CourtID, @Name, @Email, @Date, @StartTime, @EndTime, @Status)
            `);

        const reservationID = reservationResult.recordset[0].ReservationID;

        // Send notification email
        const calendarEvent = generateCalendarEvent({ court, date, startTime, endTime });
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
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
        console.error(err);
        res.status(500).send("Error creating reservation.");
    }
});

// Helper functions for formatting
const formatDate = (date) => new Date(date).toLocaleDateString("en-GB");
const formatTime = (timeString) => {
    try {
        const date = new Date(timeString);
        if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
        }
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
        console.error("Invalid time format:", timeString);
        return "Invalid Time";
    }
};

// Cancel reservation
router.put("/reservations/:id/cancel", async (req, res) => {
    const { id } = req.params;
    const { CancellationReason } = req.body;

    if (!CancellationReason) {
        return res.status(400).send("Cancellation reason is required.");
    }

    try {
        const pool = await connectToDatabase();

        // Fetch reservation details, including CourtName
        const reservationQuery = await pool.request()
            .input("ReservationID", sql.Int, id)
            .query(`
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
        await pool.request()
            .input("ReservationID", sql.Int, id)
            .input("CancellationReason", sql.NVarChar, CancellationReason)
            .input("Status", sql.NVarChar, "Cancelled")
            .query(`
                UPDATE Reservation
                SET Status = @Status, CancellationReason = @CancellationReason
                WHERE ReservationID = @ReservationID
            `);

        // Send notification email with formatted dates and times
        await transporter.sendMail({
            from: `"4Locos Padel" <${process.env.EMAIL}>`,
            to: reservation.Email,
            subject: "Reservation Cancelled",
            text: `Your reservation for ${reservation.CourtName} on ${formatDate(reservation.Date)} from ${formatTime(reservation.StartTime)} to ${formatTime(reservation.EndTime)} has been cancelled.\nReason: ${CancellationReason}`,
        });

        res.status(200).send("Reservation cancelled successfully.");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error cancelling reservation.");
    }
});

router.get("/reservations", async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).send("Email is required.");
    }

    try {
        const pool = await connectToDatabase();

        const queryResult = await pool
            .request()
            .input("Email", sql.NVarChar, email)
            .query(`
                SELECT 
                    R.ReservationID, R.Name, R.Email, R.Date, R.StartTime, R.EndTime, 
                    R.Status, R.CancellationReason, C.CourtName,
                    DATEDIFF(MINUTE, R.StartTime, R.EndTime) / 60.0 AS Duration
                FROM Reservation R
                INNER JOIN Court C ON R.CourtID = C.CourtID
                WHERE R.Email = @Email
            `);

        res.status(200).json(queryResult.recordset);
    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).send("Internal server error.");
    }
});

router.get("/reservations/day", async (req, res) => {
    const { date } = req.query;

    if (!date) {
        return res.status(400).send("Date is required.");
    }

    try {
        const pool = await connectToDatabase();

        const queryResult = await pool
            .request()
            .input("Date", sql.Date, date)
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

// Fetch all courts
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