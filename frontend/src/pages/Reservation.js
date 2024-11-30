import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Reservation.css";

function Reservation() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reservations, setReservations] = useState([]);
    const [courts, setCourts] = useState([]);
    const [userEmail, setUserEmail] = useState(null);
    const [sortField, setSortField] = useState("");
    const [modalContent, setModalContent] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");
    const [highlightedCells, setHighlightedCells] = useState({});
    const [expandedRows, setExpandedRows] = useState([]);

    const times = Array.from({ length: 15 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

    const toggleRow = (index) => {
        setExpandedRows((prev) =>
            prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
        );
    };    

    useEffect(() => {
        // Fetch logged-in user from local storage
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUserEmail(parsedUser.Email);
        }

        fetchCourts();

        if (storedUser) {
            fetchReservations(JSON.parse(storedUser).Email);
        }
    }, []);

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
        const formattedDate = date.toISOString().split("T")[0]; // Format date as YYYY-MM-DD
        fetch(`/api/reservations/day?date=${formattedDate}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(setReservations)
            .catch((error) => console.error("Error fetching reservations:", error));
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        fetchReservationsForDay(date);
    };

    const getReservationStatus = (time, courtId) => {
        const reservation = reservations.find(
            (res) =>
                res.CourtID === courtId &&
                res.StartTime <= time &&
                res.EndTime > time &&
                new Date(res.Date).toDateString() === selectedDate.toDateString()
        );
        if (!reservation) return "Available";
        return reservation.Email === userEmail ? "YourReservations" : "Reserved";
    };

    const handleCellClick = (time, courtId) => {
        setHighlightedCells((prev) => ({
            ...prev,
            [`${time}-${courtId}`]: true,
        }));
    
        const reservation = reservations.find(
            (res) =>
                res.CourtID === courtId &&
                res.StartTime <= time &&
                res.EndTime > time &&
                new Date(res.Date).toDateString() === selectedDate.toDateString()
        );
    
        setModalContent(
            reservation
                ? `Reservation Details:\nName: ${reservation.Name}\nCourt: ${reservation.CourtName}\nTime: ${time}`
                : `No reservation exists for Court ${courtId} at ${time}`
        );
    };

    const closeModal = () => {
        // Reset modal content and remove highlighted cell
        setModalContent(null);
    
        // Reset the highlighted cells state
        setHighlightedCells({});
    };


    const cancelReservation = async (id) => {
        const reason = prompt("Please provide a reason for cancellation:");
        if (!reason) {
            alert("Cancellation reason is required.");
            return;
        }

        try {
            const response = await fetch(`/api/reservations/${id}/cancel`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ CancellationReason: reason }),
            });

            if (!response.ok) throw new Error(await response.text());

            alert("Reservation cancelled successfully.");
            fetchReservations(userEmail); // Refresh reservations
        } catch (error) {
            console.error("Error cancelling reservation:", error);
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
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
                                return (
                                    <td
                                        key={`${time}-${court.CourtID}`}
                                        className={`${status.toLowerCase()} ${
                                            highlightedCells[`${time}-${court.CourtID}`]
                                                ? "highlighted-cell"
                                                : ""
                                        }`}
                                        onClick={() => handleCellClick(time, court.CourtID)}
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