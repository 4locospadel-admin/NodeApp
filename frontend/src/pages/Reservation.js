import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Reservation.css";

function Reservation() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [reservations, setReservations] = useState([]); // Replace with fetched data
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        startTime: "",
        durationHours: 0,
        durationMinutes: 30,
        court: "",
    });
    const [confirmDetails, setConfirmDetails] = useState(null);

    useEffect(() => {
        alert("This page is still under development. Most of the functions are not available.");
    }, []); // The empty dependency array ensures this runs only once when the component mounts.

    const courts = ["Court 1", "Court 2", "Court 3"]; // Replace with backend data
    const times = Array.from({ length: 33 }, (_, i) => {
        const hours = Math.floor(i / 2) + 6;
        const minutes = i % 2 === 0 ? "00" : "30";
        return `${hours}:${minutes}`;
    });

    const handleDateChange = (date) => setSelectedDate(date);

    const handleCellClick = (time, court) => {
        setFormData({ ...formData, startTime: time, court });
        setShowForm(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = () => {
        const duration =
            parseInt(formData.durationHours) * 60 +
            parseInt(formData.durationMinutes);
        const endTime = new Date(
            new Date(selectedDate).setMinutes(
                new Date(selectedDate).getMinutes() + duration
            )
        ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

        setConfirmDetails({
            court: formData.court,
            startTime: formData.startTime,
            endTime,
        });
    };

    const handleConfirm = () => {
        // Simulate saving
        setReservations([...reservations, confirmDetails]);
        setShowForm(false);
        setConfirmDetails(null);
    };

    const isReserved = (time, court) =>
        reservations.some(
            (reservation) =>
                reservation.startTime === time && reservation.court === court
        );

    return (
        <div className="reservation-page">
            <div className="date-picker">
                <DatePicker
                    selected={selectedDate}
                    onChange={handleDateChange}
                    minDate={new Date()}
                    maxDate={new Date().setMonth(new Date().getMonth() + 2)}
                    dateFormat="EEEE, MMMM d, yyyy" // Includes the day of the week
                />
            </div>

            <table className="reservation-table">
                <thead>
                    <tr>
                        <th>Hour</th>
                        {courts.map((court) => (
                            <th key={court}>{court}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {times.map((time) => (
                        <tr key={time}>
                            <td className="hour-cell">{time}</td>
                            {courts.map((court) => (
                                <td
                                    key={`${time}-${court}`}
                                    className="free"
                                    onClick={
                                        !isReserved(time, court)
                                            ? () => handleCellClick(time, court)
                                            : null
                                    }
                                ></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {showForm && (
                <div className="reservation-form">
                    <h3>Create Reservation</h3>
                    <label>
                        Email:
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleFormChange}
                        />
                    </label>
                    <label>
                        Start Time:
                        <input
                            type="text"
                            name="startTime"
                            value={formData.startTime}
                            disabled
                        />
                    </label>
                    <label>
                        Court:
                        <input type="text" name="court" value={formData.court} disabled />
                    </label>
                    <label>
                        Duration:
                        <div className="duration-picker">
                            <select
                                name="durationHours"
                                value={formData.durationHours}
                                onChange={handleFormChange}
                            >
                                {Array.from({ length: 17 }, (_, i) => i).map(
                                    (hour) => (
                                        <option key={hour} value={hour}>
                                            {hour} Hours
                                        </option>
                                    )
                                )}
                            </select>
                            <select
                                name="durationMinutes"
                                value={formData.durationMinutes}
                                onChange={handleFormChange}
                            >
                                <option value={0}>00 Minutes</option>
                                <option value={30}>30 Minutes</option>
                            </select>
                        </div>
                    </label>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setShowForm(false)}>Cancel</button>
                </div>
            )}

            {confirmDetails && (
                <div className="confirmation-modal">
                    <h3>Confirm Reservation</h3>
                    <p>
                        Are you sure you want to reserve{" "}
                        <strong>{confirmDetails.court}</strong> from{" "}
                        <strong>{confirmDetails.startTime}</strong> to{" "}
                        <strong>{confirmDetails.endTime}</strong>?
                    </p>
                    <button onClick={handleConfirm}>Confirm</button>
                    <button onClick={() => setConfirmDetails(null)}>Cancel</button>
                </div>
            )}
        </div>
    );
}

export default Reservation;