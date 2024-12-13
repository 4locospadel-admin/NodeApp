/**
 * @file ContactForm.js
 * @description A React component that allows users to send inquiries, manage their past inquiries, and sort/view them in a user-friendly interface.
 */

import React, { useState, useEffect, useCallback } from "react";
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
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    key: "createdDate",
    direction: "desc",
  });
  const [showInquiries, setShowInquiries] = useState(false);
  const [notification, setNotification] = useState(null);
  const [filter, setFilter] = useState("Open");


  /**
   * Displays a notification banner.
   * @param {string} message - The message to display.
   * @param {string} [type="success"] - The type of notification (`success` or `error`).
   */
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  /**
   * Fetches inquiries from the server and updates the `inquiries` state.
   */
  const fetchInquiries = useCallback(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setEmail(parsedUser.Email);
      const role = parsedUser.Role;
  
      const url =
        role === "admin"
          ? `/api/inquiries`
          : `/api/inquiries?email=${encodeURIComponent(parsedUser.Email)}`;
  
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setInquiries(data);
          setFilteredInquiries(data.filter((inq) => inq.Status === filter)); // Default filter
        })
        .catch((error) => console.error("Error fetching inquiries:", error));
    }
  }, [filter]); // Add dependencies here
  
  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

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
    setFilteredInquiries((prevInquiries) =>
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

    setFilteredInquiries((prevInquiries) =>
      [...prevInquiries].sort((a, b) => {
        if (a[key] < b[key]) return newDirection === "asc" ? -1 : 1;
        if (a[key] > b[key]) return newDirection === "asc" ? 1 : -1;
        return 0;
      })
    );
  };

  /**
   * Handles the change of an inquiry's status.
   * @param {number} id - The ID of the inquiry to update.
   * @param {string} status - The new status to set.
   */
  const handleStatusChange = (id, status) => {
    setFilteredInquiries((prevInquiries) =>
      prevInquiries.map((inquiry) =>
        inquiry.Id === id ? { ...inquiry, Status: status } : inquiry
      )
    );
    setInquiries((prevInquiries) =>
      prevInquiries.map((inquiry) =>
        inquiry.Id === id ? { ...inquiry, Status: status } : inquiry
      )
    );
  };

  /**
   * Filters inquiries based on the selected status.
   * @param {string} status - The selected status to filter by.
   */
  const handleFilterChange = (status) => {
    setFilter(status);
    setFilteredInquiries(
      status === "All"
        ? inquiries
        : inquiries.filter((inquiry) => inquiry.Status === status)
    );
  };
  
  /**
   * Handles the change of an inquiry's response text.
   * @param {number} id - The ID of the inquiry to update.
   * @param {string} response - The new response text.
   */
  const handleResponseChange = (id, response) => {
    setFilteredInquiries((prevInquiries) =>
      prevInquiries.map((inquiry) =>
        inquiry.Id === id ? { ...inquiry, Answer: response } : inquiry
      )
    );
    setInquiries((prevInquiries) =>
      prevInquiries.map((inquiry) =>
        inquiry.Id === id ? { ...inquiry, Answer: response } : inquiry
      )
    );
  };
  
  /**
   * Saves the changes made to an inquiry's status or response.
   * Sends an email with a formatted summary.
   * @param {number} id - The ID of the inquiry to save changes for.
   */
  const saveInquiryChanges = async (id) => {
    const inquiry = inquiries.find((inquiry) => inquiry.Id === id);
    if (!inquiry) return;

    try {
      const response = await fetch(`/api/inquiries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: inquiry.Status,
          response: inquiry.Answer,
          subject: inquiry.Subject,
          category: inquiry.Category,
          description: inquiry.Description,
          email: inquiry.Email
        }),
      });

      if (!response.ok) throw new Error(await response.text());

      // Show banner notification instead of alert
      showNotification("Response saved successfully!");

      // Refetch inquiries to update the list
      fetchInquiries();
    } catch (error) {
      console.error("Error saving inquiry changes:", error);
      showNotification("Error saving changes. Please try again.", "error");
    }
  };

  return (
    <div className="contact-page">
      {notification && (
        <div className={`notification-banner ${notification.type}`}>
          {notification.message}
        </div>
      )}
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
          {/* Filter Buttons */}
          <div className="filter-buttons">
            {["All", "Open", "In Progress", "Closed"].map((status) => (
              <button
                key={status}
                className={`filter-button ${
                  filter === status ? "active" : ""
                }`}
                onClick={() => handleFilterChange(status)}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Inquiry Header */}
          <div className="inquiry-header">
            <span onClick={() => sortInquiries("Subject")}>Subject</span>
            <span onClick={() => sortInquiries("Status")}>Status</span>
            <span onClick={() => sortInquiries("Created")}>Created</span>
          </div>

          {/* Inquiry Rows */}
          {filteredInquiries.map((inquiry) => (
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
                    <strong>Recieve Notification:</strong>
                    <p>{inquiry.Notification ? "Yes" : "No"}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Message:</strong>
                    <p>{inquiry.Description}</p>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <select
                      value={inquiry.Status}
                      onChange={(e) => handleStatusChange(inquiry.Id, e.target.value)}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div className="detail-item">
                    <strong>Response:</strong>
                    <textarea
                      value={inquiry.Answer || ""}
                      onChange={(e) =>
                        handleResponseChange(inquiry.Id, e.target.value)
                      }
                    ></textarea>
                  </div>
                  <button onClick={() => saveInquiryChanges(inquiry.Id)}>
                    Save
                  </button>
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
