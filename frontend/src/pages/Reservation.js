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
    const [sortOrder, setSortOrder] = useState("asc");

    const times = Array.from({ length: 15 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

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

    const handleDateChange = (date) => setSelectedDate(date);

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

    const isReserved = (time, courtId) => {
        return reservations.some(
            (reservation) =>
                reservation.StartTime === time &&
                reservation.CourtID === courtId &&
                new Date(reservation.Date).toDateString() === selectedDate.toDateString()
        );
    };

    /*const getReservationStatus = (time, courtId) => {
        const reservation = reservations.find(
            (res) =>
                res.StartTime === time &&
                res.CourtID === courtId &&
                new Date(res.Date).toDateString() === selectedDate.toDateString()
        );
        if (!reservation) return "Available";
        return reservation.Status === "Created"
            ? "UserReserved"
            : "OtherReserved";
    };
    */

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
                            {courts.map((court) => (
                                <td
                                    key={`${time}-${court.CourtID}`}
                                    className={isReserved(time, court.CourtID) ? "reserved" : "available"}
                                ></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="legend">
                <div className="legend-item available">Available</div>
                <div className="legend-item user-reserved">Your Reservation</div>
                <div className="legend-item other-reserved">Reserved</div>
            </div>

            <hr className="divider" />

            {userEmail ? (
                <>
                    <h3>Your Reservations</h3>
                    <table className="reservations-list">
                        <thead>
                            <tr>
                                <th onClick={() => sortReservations("Name")}>Name</th>
                                <th>Email</th>
                                <th onClick={() => sortReservations("Date")}>Date</th>
                                <th onClick={() => sortReservations("StartTime")}>Start</th>
                                <th>End</th>
                                <th>Duration</th>
                                <th onClick={() => sortReservations("Status")}>Status</th>
                                <th className="action-column"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((reservation) => (
                                <tr key={reservation.ReservationID}>
                                    <td>{reservation.Name}</td>
                                    <td>{reservation.Email}</td>
                                    <td>{new Date(reservation.Date).toLocaleDateString()}</td>
                                    <td>{new Date(reservation.StartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{new Date(reservation.EndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>{reservation.Duration} hours</td>
                                    <td>{reservation.Status}</td>
                                    <td>
                                        {reservation.Status === "Created" && (
                                            <button
                                                className="cancel-button"
                                                onClick={() => cancelReservation(reservation.ReservationID)}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </td>
                                </tr>
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