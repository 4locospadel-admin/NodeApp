/**
 * @file Reservation.js
 * @description A React component for managing padel court reservations.
 *              It allows users to view, create, and cancel reservations.
 */

import React, { useState, useEffect, useCallback } from "react";
import { format } from 'date-fns';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Reservation.css";

/**
 * Renders the "Reservation" page, providing functionality to view available time slots,
 * create reservations, and manage existing reservations.
 *
 * Features:
 * - Fetch courts and reservations dynamically from the server.
 * - Create new reservations with a configurable duration.
 * - View and sort personal reservations.
 * - Cancel reservations with a reason.
 * - Interactive date picker and real-time updates for availability.
 *
 * @component
 */
function Reservation() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [courts, setCourts] = useState([]);
  const [userEmail, setUserEmail] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [sortField, setSortField] = useState("");
  const [modalContent, setModalContent] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [highlightedCells, setHighlightedCells] = useState({});
  const [expandedRows, setExpandedRows] = useState([]);
  const [tableReservations, setTableReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reservationModal, setReservationModal] = useState(null);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(1);

  // List of time slots (8:00 AM to 10:00 PM)
  const times = Array.from(
    { length: 15 },
    (_, i) => `${String(8 + i).padStart(2, "0")}:00`
  );

  /**
   * Toggles the expansion of a reservation row in the table.
   * @param {number} index - The index of the reservation row to toggle.
   */
  const toggleRow = (index) => {
    setExpandedRows((prevExpandedRows) =>
      prevExpandedRows.includes(index) ? [] : [index]
    );
  };

  /**
   * Compares two dates by normalizing them to midnight.
   * @param {string|Date} reservationDate - The date to compare.
   * @returns {boolean} - True if the reservation date is the same or after today.
   */
  const isSameOrAfterToday = (reservationDate) => {
    const today = new Date();
    const resDate = new Date(reservationDate);

    // Normalize both dates to midnight
    today.setHours(0, 0, 0, 0);
    resDate.setHours(0, 0, 0, 0);

    return resDate >= today;
  };

  /**
   * Fetches all courts available for reservations.
   */
  const fetchCourts = useCallback(() => {
    fetch("/api/courts")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(setCourts)
      .catch((error) => console.error("Error fetching courts:", error));
  }, []);

  /**
   * Fetches reservations for the user or all reservations for admins.
   * @param {string} email - User email (ignored if role is admin).
   */
  const fetchReservations = useCallback(() => {
    console.log("fetching all")
    const url =
      userRole === "admin"
        ? "/api/reservations"
        : `/api/reservations?email=${encodeURIComponent(userEmail)}`;

    fetch(url)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(setReservations)
      .catch((error) => console.error("Error fetching reservations:", error));
  }, [userRole, userEmail]);

  /**
   * Fetches all reservations for a specific day.
   * @param {Date} date - The date for which reservations are to be fetched.
   */
  const fetchReservationsForDay = useCallback((date) => {
    const formattedDate = date.toISOString().split("T")[0];
    fetch(`/api/reservations/day?date=${formattedDate}`)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      })
      .then(setTableReservations) // Set tableReservations here
      .catch((error) => console.error("Error fetching reservations for day:", error));
  }, []);

  /**
   * Handles the change in selected date and fetches reservations for the selected day.
   * @param {Date} date - The selected date.
   */
  const handleDateChange = (date) => {
    setSelectedDate(date);
    fetchReservationsForDay(date);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserEmail(parsedUser.Email);
      setUserName(parsedUser.Name);
      setUserRole(parsedUser.Role);
      console.log("use effect")

      fetchReservations();
    }
    fetchCourts();
    fetchReservationsForDay(new Date());
  }, [fetchReservations, fetchCourts, fetchReservationsForDay]);

  useEffect(() => {}, [tableReservations]);

  /**
   * Determines the reservation status for a specific time and court.
   * @param {string} time - The time slot in "HH:mm" format.
   * @param {number} courtId - The ID of the court.
   * @returns {string} The status of the reservation (e.g., "Available", "Reserved").
   */
  const getReservationStatus = (time, courtId) => {
    const startDate = new Date(selectedDate);
    const [hours] = time.split(":").map(Number);
    startDate.setHours(hours, 0, 0, 0);

    const reservation = tableReservations.find(
      (res) =>
        res.CourtID === courtId &&
        new Date(res.Date).toDateString() === selectedDate.toDateString() &&
        new Date(res.StartTime).getUTCHours() <= startDate.getUTCHours() &&
        new Date(res.EndTime).getUTCHours() > startDate.getUTCHours() &&
        res.Status !== "Cancelled"
    );

    if (!reservation) return "Available";
    return reservation.Email === userEmail ? "YourReservation" : "Reserved";
  };

  /**
   * Handles cell click events in the reservation table to create or view reservations.
   * @param {string} time - The time slot clicked.
   * @param {object} court - The court associated with the clicked cell.
   */
  const handleCellClick = (time, court) => {
    const startDate = new Date(selectedDate);
    const [hours, minutes] = time.split(":").map(Number);
    startDate.setHours(hours, minutes, 0, 0);

    const now = new Date();
    if (startDate < now) {
      return; // Prevent click on past times
    }

    const reservationIndex = reservations.findIndex((res) => {
      const reservationDate = new Date(res.Date);
      reservationDate.setHours(0, 0, 0, 0);

      const normalizedSelectedDate = new Date(selectedDate);
      normalizedSelectedDate.setHours(0, 0, 0, 0);

      const isSameDate =
        formatDate(res.Date) === formatDate(normalizedSelectedDate);
      const [cellHours] = time.split(":").map(Number);
      const reservationStartHour = new Date(res.StartTime).getHours();
      const reservationEndHour = new Date(res.EndTime).getHours();

      return (
        res.Status !== "Cancelled" &&
        res.CourtID === court.CourtID &&
        isSameDate &&
        cellHours >= reservationStartHour &&
        cellHours < reservationEndHour
      );
    });

    if (reservationIndex !== -1) {
      // Unpack the found reservation in the list below the table
      const reservation = reservations[reservationIndex];

      if (reservation.Email === userEmail) {
        // Unpack the row and scroll into view
        toggleRow(reservationIndex);

        // Scroll to the unpacked row
        setTimeout(() => {
          const rowElement = document.querySelector(
            `.reservations-list tbody tr:nth-child(${reservationIndex + 1})`
          );
          if (rowElement) {
            rowElement.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 100);
      } else {
        alert("You cannot interact with reservations made by others.");
      }
    } else if (!userEmail) {
      setModalContent("Please log in to create a reservation.");
    } else {
      // Open reservation creation modal
      setReservationModal({
        courtId: court.CourtID,
        courtName: court.CourtName,
        date: formatDate(selectedDate),
        startTime: time,
      });
    }
  };

  const closeModal = () => {
    setModalContent(null);
    setHighlightedCells({});
  };

  /**
   * Creates a new reservation with the specified details.
   * @param {object} details - The reservation details.
   */
  const createReservation = async (details) => {
    setLoading(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          court: details.courtId,
          email: userEmail,
          name: userName,
          date: details.date,
          startTime: details.startTime,
          endTime: details.endTime,
        }),
      });

      if (!response.ok) throw new Error(await response.text());
      alert("Reservation created successfully.");
      fetchReservations();
    } catch (error) {
      console.error("Error creating reservation:", error);
      alert("Failed to create reservation.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cancels an existing reservation with a given ID.
   * @param {number} id - The ID of the reservation to cancel.
   */
  const cancelReservation = async (id) => {
    const reason = prompt("Please provide a reason for cancellation:");
    if (!reason) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/reservations/${id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CancellationReason: reason }),
      });

      if (!response.ok) throw new Error(await response.text());
      alert("Reservation cancelled successfully.");
      fetchReservations();
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert("Failed to cancel reservation.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sorts the list of reservations based on a specified field.
   * @param {string} field - The field to sort by (e.g., "Date", "CourtName").
   */
  const sortReservations = (field) => {
    const newSortOrder =
      sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(newSortOrder);

    const sortedReservations = [...reservations].sort((a, b) => {
      const valueA = field === "Date" ? new Date(a[field]) : a[field];
      const valueB = field === "Date" ? new Date(b[field]) : b[field];
      return (valueA > valueB ? 1 : -1) * (newSortOrder === "asc" ? 1 : -1);
    });

    setReservations(sortedReservations);
  };

  /**
   * Formats a date to "dd/MM/yyyy".
   * @param {string|Date} date - The date to format.
   * @returns {string} The formatted date string.
   */
  const formatDate = (date) => {
    try {
      return format(new Date(date), "dd/MM/yyyy");
    } catch (error) {
      console.error("Invalid date format:", date);
      return "Invalid Date";
    }
  };

  /**
   * Formats a time string to "HH:mm" in the specified timezone.
   * @param {string} timeString - The time string to format.
   * @param {string} timeZone - The timezone to format the time for.
   * @returns {string} The formatted time string.
   */
  const formatTime = (timeString, timeZone = "Europe/Bratislava") => {
    try {
      const date = new Date(timeString); // Parse the UTC time
      const formatter = new Intl.DateTimeFormat("en-GB", {
        timeZone, // Specify the desired time zone
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23", // 24-hour format
      });
      return formatter.format(date); // Format the date in the desired time zone
    } catch (error) {
      console.error("Invalid time format:", timeString);
      return "Invalid Time";
    }
  };

  return (
    <div className="reservation-page">
      {loading && (
        <div className="loading-indicator">
          <p>Loading...</p>
        </div>
      )}

      <div className="date-picker">
        <DatePicker
          selected={selectedDate}
          onChange={(date) => handleDateChange(date)}
          minDate={new Date()}
          maxDate={new Date().setMonth(new Date().getMonth() + 2)}
          dateFormat="EEEE, MMMM d, yyyy"
        />
      </div>

      <div className="legend">
        <div className="legend-item available">Available</div>
        <div className="legend-item user-reserved">Your Reservations</div>
        <div className="legend-item other-reserved">Reserved</div>
      </div>

      <table className="reservation-table">
        <thead>
          <tr>
            <th>Hour</th>
            {courts.map((court) => (
              <th key={court.CourtID}>{court.CourtName}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map((time) => (
            <tr key={time}>
              <td className="hour-cell">{time}</td>
              {courts.map((court) => {
                const status = getReservationStatus(time, court.CourtID);
                const isClickable =
                  status === "Available" || status === "YourReservation";

                return (
                  <td
                    key={`${time}-${court.CourtID}`}
                    className={`${status.toLowerCase()} ${
                      highlightedCells[`${time}-${court.CourtID}`]
                        ? "highlighted-cell"
                        : ""
                    }`}
                    onClick={
                      isClickable
                        ? () => handleCellClick(time, court)
                        : undefined
                    }
                    style={{ cursor: isClickable ? "pointer" : "not-allowed" }}
                  ></td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {modalContent && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <p>{modalContent}</p>
          </div>
        </div>
      )}

      {reservationModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Create Reservation</h3>
            <p>
              <strong>Date:</strong> {reservationModal.date}
            </p>
            <p>
              <strong>Start Time:</strong> {reservationModal.startTime}
            </p>
            <p>
              <strong>Court:</strong> {reservationModal.courtName}
            </p>

            <label>
              <strong>Duration (hours):</strong>
              <select
                value={selectedDuration}
                onChange={(e) => setSelectedDuration(Number(e.target.value))}
              >
                {[...Array(5).keys()].map((d) => (
                  <option key={d + 1} value={d + 1}>
                    {d + 1}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="cancel-button"
              onClick={() => setReservationModal(null)}
            >
              Close
            </button>
            <button
              className="confirm-button"
              onClick={() => {
                const startHour = Number(
                  reservationModal.startTime.split(":")[0]
                );
                const endHour = startHour + selectedDuration;

                // Check if the end time exceeds the limit (23:00)
                if (endHour > 23) {
                  alert(
                    "Invalid duration: Reservations cannot end after 23:00."
                  );
                  return; // Stop the process if invalid
                }

                setConfirmationModal({
                  ...reservationModal,
                  duration: selectedDuration,
                  endTime: `${endHour}:00`, // No need to calculate minutes since it always ends at 00
                });

                setReservationModal(null);
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      )}

      {confirmationModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm Reservation</h3>
            <p>
              <strong>Name:</strong> {userName}
            </p>
            <p>
              <strong>Email:</strong> {userEmail}
            </p>
            <p>
              <strong>Date:</strong> {confirmationModal.date}
            </p>
            <p>
              <strong>Start Time:</strong> {confirmationModal.startTime}
            </p>
            <p>
              <strong>End Time:</strong> {confirmationModal.endTime}
            </p>
            <p>
              <strong>Court:</strong> {confirmationModal.courtName}
            </p>
            <p>
              <strong>Duration:</strong> {confirmationModal.duration} hours
            </p>

            <button
              className="cancel-button"
              onClick={() => setConfirmationModal(null)}
            >
              Cancel
            </button>
            <button
              className="confirm-button"
              onClick={async () => {
                await createReservation(confirmationModal);
                setConfirmationModal(null);
              }}
              disabled={loading} // Disable button during loading
            >
              {loading ? "Creating..." : "Create Reservation"}
            </button>
          </div>
        </div>
      )}

      <hr className="divider" />

      {userEmail ? (
        <>
          <h3>Your Reservations</h3>
          <table className="reservations-list">
            <thead>
              <tr>
                <th onClick={() => sortReservations("Date")}>Date</th>
                <th onClick={() => sortReservations("StartTime")}>Start</th>
                <th>End</th>
                <th onClick={() => sortReservations("CourtName")}>Court</th>
                <th onClick={() => sortReservations("Status")}>Status</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation, index) => (
                <React.Fragment key={reservation.ReservationID}>
                  {/* Top-level row */}
                  <tr onClick={() => toggleRow(index)}>
                    <td>{formatDate(reservation.Date)}</td>
                    <td>{formatTime(reservation.StartTime, "Europe/Bratislava")}</td>
                    <td>{formatTime(reservation.EndTime, "Europe/Bratislava")}</td>
                    <td>{reservation.CourtName}</td>
                    <td>{reservation.Status}</td>
                  </tr>

                  {/* Expandable row */}
                  {expandedRows.includes(index) && (
                    <tr className="expanded-row">
                      <td colSpan= "5">
                        <div className="expanded-content">
                          <p>
                            <strong>Name:</strong> {reservation.Name}
                          </p>
                          <p>
                            <strong>Email:</strong> {reservation.Email}
                          </p>
                          <p>
                            <strong>Duration:</strong> {reservation.Duration} hours
                          </p>
                          {reservation.Status === "Cancelled" && (
                            <p>
                              <strong>Cancellation Reason:</strong>{" "}
                              {reservation.CancellationReason}
                            </p>
                          )}
                          {reservation.Status === "Created" && isSameOrAfterToday(reservation.Date) && (
                            <button onClick={() => cancelReservation(reservation.ReservationID)}>Cancel</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </>
      ) : (
        <p>Please log in to view your reservations.</p>
      )}
    </div>
  );
}

export default Reservation;
