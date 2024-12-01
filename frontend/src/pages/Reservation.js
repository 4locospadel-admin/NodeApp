import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Reservation.css";

function Reservation() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reservations, setReservations] = useState([]);
    const [courts, setCourts] = useState([]);
    const [userEmail, setUserEmail] = useState(null);
    const [userName, setUserName] = useState(null);
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


    const times = Array.from({ length: 15 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

    const toggleRow = (index) => {
        setExpandedRows((prevExpandedRows) =>
            prevExpandedRows.includes(index) ? [] : [index]
        );
    };

    useEffect(() => {
        // Fetch logged-in user from local storage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserEmail(parsedUser.Email);
            setUserName(parsedUser.Name);
    
            // Fetch reservations for the user
            fetchReservations(parsedUser.Email);
        }
    
        // Fetch courts
        fetchCourts();
    
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        fetchReservationsForDay(today);
    }, []);

    useEffect(() => {
    }, [tableReservations]);

    const fetchCourts = () => {
        fetch("/api/courts")
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(setCourts)
            .catch((error) => console.error("Error fetching courts:", error));
    };

    const fetchReservations = (email) => {
        fetch(`/api/reservations?email=${encodeURIComponent(email)}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(setReservations)
            .catch((error) => console.error("Error fetching reservations:", error));
    };

    const fetchReservationsForDay = (date) => {
        const localDate = new Date(date);
        const year = localDate.getFullYear();
        const month = String(localDate.getMonth() + 1).padStart(2, "0");
        const day = String(localDate.getDate()).padStart(2, "0");
    
        const formattedDate = `${year}-${month}-${day}`;
    
        fetch(`/api/reservations/day?date=${formattedDate}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                setTableReservations(data); // Ensure the table updates dynamically
            })
            .catch((error) => console.error("Error fetching reservations:", error));
    };

    const handleDateChange = (date) => {
        const localDate = new Date(date);
        localDate.setHours(0, 0, 0, 0);
    
        setSelectedDate(localDate);
        fetchReservationsForDay(localDate);
    };

    const getReservationStatus = (time, courtId) => {
        const startDate = new Date(selectedDate);
        const [hours, minutes] = time.split(":").map(Number);
        startDate.setHours(hours, minutes, 0, 0);
    
        const now = new Date(); // Current time for comparison
        if (startDate < now) {
            return "Past"; // Add "Past" status for times in the past
        }
    
        const reservation = tableReservations.find(
            (res) =>
                res.CourtID === courtId &&
                new Date(res.Date).toDateString() === selectedDate.toDateString() &&
                new Date(res.StartTime).getHours() <= startDate.getHours() &&
                new Date(res.EndTime).getHours() > startDate.getHours()
        );
    
        if (!reservation || reservation.Status === "Cancelled") return "Available";
        return reservation.Email === userEmail ? "YourReservations" : "Reserved";
    };

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
    
            const isSameDate = formatDate(res.Date) === formatDate(normalizedSelectedDate);
            const [cellHours] = time.split(":").map(Number);
            const reservationStartHour = new Date(res.StartTime).getHours();
            const reservationEndHour = new Date(res.EndTime).getHours();
    
            return (
                res.CourtID === court.CourtID &&
                isSameDate &&
                cellHours >= reservationStartHour &&
                cellHours < reservationEndHour
            );
        });
    
        if (reservationIndex !== -1) {
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

    const createReservation = async (details) => {
        setLoading(true);
    
        try {
            const response = await fetch("/api/reservations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    court: String(details.courtId),
                    email: userEmail,
                    name: userName,
                    date: details.date,
                    startTime: details.startTime,
                    endTime: details.endTime,
                }),
            });
    
            if (!response.ok) throw new Error(await response.text());
    
            alert("Reservation created successfully.");
            fetchReservations(userEmail);
            fetchReservationsForDay(selectedDate);
        } catch (error) {
            console.error("Error creating reservation:", error);
            alert("Failed to create reservation.");
        } finally {
            setLoading(false);
        }
    };

    const cancelReservation = async (id) => {
        const reason = prompt("Please provide a reason for cancellation:");
        if (!reason) {
            alert("Cancellation reason is required.");
            return;
        }
    
        setLoading(true); // Start loading
    
        try {
            const response = await fetch(`/api/reservations/${id}/cancel`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ CancellationReason: reason }),
            });
    
            if (!response.ok) throw new Error(await response.text());
    
            alert("Reservation cancelled successfully.");
            fetchReservations(userEmail); // Refresh reservations
            fetchReservationsForDay(selectedDate); // Refresh table reservations
        } catch (error) {
            console.error("Error cancelling reservation:", error);
            alert("Failed to cancel reservation.");
        } finally {
            setLoading(false); // End loading
        }
    };

    const sortReservations = (field) => {
        const newSortOrder = sortField === field && sortOrder === "asc" ? "desc" : "asc";
        setSortField(field);
        setSortOrder(newSortOrder);

        const sortedReservations = [...reservations].sort((a, b) => {
            const valueA = field === "Date" ? new Date(a[field]) : a[field];
            const valueB = field === "Date" ? new Date(b[field]) : b[field];
            return (valueA > valueB ? 1 : -1) * (newSortOrder === "asc" ? 1 : -1);
        });

        setReservations(sortedReservations);
    };

    const formatDate = (date) => new Date(date).toLocaleDateString("en-GB");
    const formatTime = (timeString) => {
        try {
            const date = new Date(timeString);
            if (isNaN(date.getTime())) {
                throw new Error("Invalid date");
            }
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" , hourCycle: 'h23'});
        } catch (error) {
            console.error("Invalid time format:", timeString);
            return "Invalid Time";
        }
    };

    return (
        <div className="reservation-page">
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

            {loading && (
                <div className="loading-indicator">
                    <p>Loading...</p>
                </div>
            )}

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
                                const isClickable = status === "Available" || status === "YourReservations";

                                return (
                                    <td
                                        key={`${time}-${court.CourtID}`}
                                        className={`${status.toLowerCase()} ${
                                            highlightedCells[`${time}-${court.CourtID}`]
                                                ? "highlighted-cell"
                                                : ""
                                        }`}
                                        onClick={isClickable ? () => handleCellClick(time, court) : undefined}
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
                        <p><strong>Date:</strong> {reservationModal.date}</p>
                        <p><strong>Start Time:</strong> {reservationModal.startTime}</p>
                        <p><strong>Court:</strong> {reservationModal.courtName}</p>
                        
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

                        <button className="cancel-button" onClick={() => setReservationModal(null)}>Close</button>
                        <button
                            className="confirm-button"
                            onClick={() => {
                                const startHour = Number(reservationModal.startTime.split(":")[0]);
                                const endHour = startHour + selectedDuration;

                                // Check if the end time exceeds the limit (23:00)
                                if (endHour > 23) {
                                    alert("Invalid duration: Reservations cannot end after 23:00.");
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
                        <p><strong>Name:</strong> {userName}</p>
                        <p><strong>Email:</strong> {userEmail}</p>
                        <p><strong>Date:</strong> {confirmationModal.date}</p>
                        <p><strong>Start Time:</strong> {confirmationModal.startTime}</p>
                        <p><strong>End Time:</strong> {confirmationModal.endTime}</p>
                        <p><strong>Court:</strong> {confirmationModal.courtName}</p>
                        <p><strong>Duration:</strong> {confirmationModal.duration} hours</p>

                        <button className="cancel-button" onClick={() => setConfirmationModal(null)}>Cancel</button>
                        <button className="confirm-button"
                            onClick={async () => {
                                await createReservation(confirmationModal);
                                setConfirmationModal(null);
                            }}
                        >
                            Create Reservation
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
                                        <td>{formatTime(reservation.StartTime)}</td>
                                        <td>{formatTime(reservation.EndTime)}</td>
                                        <td>{reservation.CourtName}</td>
                                        <td>{reservation.Status}</td>
                                    </tr>

                                    {/* Expandable row */}
                                    {expandedRows.includes(index) && (
                                        <tr className="expanded-row">
                                            <td colSpan="5">
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
                                                    {reservation.Status === "Created" && (
                                                        <button
                                                            className="cancel-button"
                                                            onClick={(e) => {
                                                                e.stopPropagation(); // Prevent row collapse
                                                                cancelReservation(reservation.ReservationID);
                                                            }}
                                                        >
                                                            Cancel
                                                        </button>
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