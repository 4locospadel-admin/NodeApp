/**
 * @file ContactForm.js
 * @description A React component that allows users to send inquiries, manage their past inquiries, and sort/view them in a user-friendly interface.
 */

import React, { useState, useEffect } from "react";
import "./ContactForm.css";

/**
 * Renders the "Contact Us" form and inquiry management interface.
 *
 * Features:
 * - Allows users to submit inquiries with categories, subjects, and messages.
 * - Validates email and form fields before submission.
 * - Fetches and displays a user's past inquiries.
 * - Provides sorting options for inquiries by subject, status, or creation date.
 * - Expands/collapses inquiry details for better visibility.
 *
 * @component
 */
function ContactForm() {
  const [Email, setEmail] = useState("");
  const [category, setCategory] = useState("Question");
  const [receiveNotifications, setReceiveNotifications] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [placeholder, setPlaceholder] = useState("Write us anything");
  const [inquiries, setInquiries] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "createdDate",
    direction: "desc",
  });
  const [showInquiries, setShowInquiries] = useState(false);

  useEffect(() => {
    // Retrieve the logged-in user from local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setEmail(parsedUser.Email); // Pre-fill the email field

      // Fetch inquiries using the stored email
      fetch(`/api/inquiries?email=${encodeURIComponent(parsedUser.Email)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setInquiries(data); // Update inquiries state
        })
        .catch((error) => console.error("Error fetching inquiries:", error));
    }
  }, []);

  /**
   * Validates an email address.
   * @param {string} email - The email address to validate.
   * @returns {boolean} `true` if the email is valid, otherwise `false`.
   */
  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  /**
   * Checks if the form is valid for submission.
   * @returns {boolean} `true` if the form is valid, otherwise `false`.
   */
  const isFormValid = () => Email && subject && message && isEmailValid(Email);

  /**
   * Handles the submission of a new inquiry.
   */
  const handleSave = async () => {
    if (!isFormValid()) return;

    const inquiry = {
      Email: Email,
      Category: category,
      Subject: subject,
      Description: message,
      Notification: receiveNotifications,
    };

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(inquiry),
      });

      if (response.ok) {
        const createdInquiry = await response.json();
        setInquiries((prev) => [createdInquiry, ...prev]);
        alert("Inquiry successfully created!");
        setEmail("");
        setSubject("");
        setMessage("");
        setReceiveNotifications(false);
        setCategory("Question");
        window.location.reload();
      } else {
        throw new Error("Failed to create inquiry.");
      }
    } catch (error) {
      console.error("Error creating inquiry:", error);
      alert("There was an error submitting your inquiry.");
    }
  };

  /**
   * Toggles the expansion of an inquiry row to show/hide details.
   * @param {number} Id - The ID of the inquiry to expand/collapse.
   */
  const toggleExpandRow = (Id) => {
    setInquiries((prevInquiries) =>
      prevInquiries.map((inquiry) =>
        inquiry.Id === Id
          ? { ...inquiry, isExpanded: !inquiry.isExpanded }
          : inquiry
      )
    );
  };

  /**
   * Sorts inquiries based on a selected key and direction.
   * @param {string} key - The key to sort by (e.g., "Subject", "Status", "Created").
   */
  const sortInquiries = (key) => {
    const newDirection =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction: newDirection });

    setInquiries((prevInquiries) =>
      [...prevInquiries].sort((a, b) => {
        if (a[key] < b[key]) return newDirection === "asc" ? -1 : 1;
        if (a[key] > b[key]) return newDirection === "asc" ? 1 : -1;
        return 0;
      })
    );
  };

  return (
    <div className="contact-page">
      <h2>Contact us</h2>

      <div className="form">
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="Question">Question</option>
            <option value="Damage">Damage</option>
            <option value="Complaint">Complaint</option>
            <option value="Appreciation">Appreciation</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="email">Your Email</label>
          <input
            type="email"
            id="email"
            value={Email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
          />
          {!isEmailValid(Email) && Email && (
            <small style={{ color: "red" }}>Invalid email format</small>
          )}
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="notifications"
            checked={receiveNotifications}
            onChange={(e) => setReceiveNotifications(e.target.checked)}
          />
          <label htmlFor="notifications">
            I want to receive email notifications about responses or inquiry
            status changes.
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="subject">Subject</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            maxLength={100}
          />
          <small>{100 - subject.length} characters remaining</small>
        </div>

        <div className="form-group">
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder}
            onFocus={() => setPlaceholder("")}
            onBlur={() => setPlaceholder("Write us anything")}
          ></textarea>
          <small>{500 - message.length} characters remaining</small>
        </div>

        <button
          onClick={handleSave}
          className="send-button"
          disabled={!isFormValid()}
        >
          Send
        </button>
      </div>

      <hr className="divider" />

      <button
        className={`toggle-inquiries ${
          showInquiries ? "blue-button" : "yellow-button"
        }`}
        onClick={() => setShowInquiries(!showInquiries)}
      >
        {showInquiries ? "Hide Past Inquiries" : "Show Past Inquiries"}
      </button>

      {showInquiries && (
        <div className="inquiry-list">
          {/* Inquiry Header */}
          <div className="inquiry-header">
            <span onClick={() => sortInquiries("Subject")}>Subject</span>
            <span onClick={() => sortInquiries("Status")}>Status</span>
            <span onClick={() => sortInquiries("Created")}>Created</span>
          </div>

          {/* Inquiry Rows */}
          {inquiries.map((inquiry) => (
            <div key={inquiry.Id} className="inquiry-row">
              {/* Summary Row */}
              <div className="inquiry-summary">
                <span>{inquiry.Subject}</span>
                <span>{inquiry.Status}</span>
                <span>{new Date(inquiry.Created).toLocaleDateString()}</span>
                <button onClick={() => toggleExpandRow(inquiry.Id)}>
                  {inquiry.isExpanded ? "▲" : "▼"}
                </button>
              </div>

              {/* Expanded Details */}
              {inquiry.isExpanded && (
                <div className="inquiry-details">
                  <div className="detail-item">
                    <strong>Category:</strong>
                    <p>{inquiry.Category}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Notification:</strong>
                    <p>{inquiry.Notification ? "Yes" : "No"}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Message:</strong>
                    <p>{inquiry.Description}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Response:</strong>
                    <p>{inquiry.Answer || "No response yet"}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ContactForm;
