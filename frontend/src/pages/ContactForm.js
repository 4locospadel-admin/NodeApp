import React, { useState, useEffect } from 'react';
import './ContactForm.css';

function ContactForm() {
  const [inquiries, setInquiries] = useState([]);

  // Fetch inquiries from the backend API
  useEffect(() => {
    fetch('/api/inquiries')
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setInquiries(data)
      })
      .catch(error => console.error('Error fetching inquiries:', error));
  }, []);

  return (
    <div className="contact-page">
      <h2>Support Inquiries</h2>
      {inquiries.length > 0 ? (
        <table className="inquiry-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Subject</th>
              <th>Description</th>
              <th>Answer</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inquiry) => (
              <tr key={inquiry.Id}>
                <td>{inquiry.Id}</td>
                <td>{inquiry.Subject}</td>
                <td>{inquiry.Description}</td>
                <td>{inquiry.Answer || 'No Answer Yet'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No inquiries available.</p>
      )}
    </div>
  );
}

export default ContactForm;