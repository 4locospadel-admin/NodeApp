import React, { useState, useEffect } from 'react';
import './ContactForm.css';

function ContactForm() {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Question');
  const [receiveNotifications, setReceiveNotifications] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [placeholder, setPlaceholder] = useState('Write us anything');

  const handleSave = () => {
    if (!email || !subject || !message) {
      alert('Please fill out all fields before saving.');
      return;
    }
    const inquiry = { email, category, subject, message };
    console.log('Saved Inquiry:', inquiry);
    // Add save logic here (e.g., API call to backend)
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
          />
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="notifications"
            checked={receiveNotifications}
            onChange={(e) => setReceiveNotifications(e.target.checked)}
          />
          <label htmlFor="notifications">
            I want to receive email notifications about responses or inquiry status changes.
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
            onFocus={() => setPlaceholder('')}
            onBlur={() => setPlaceholder('Write us anything')}
          ></textarea>
          <small>{500 - subject.length} characters remaining</small>
        </div>

        <button onClick={handleSave} className="save-button">Save</button>
      </div>
    </div>
  );
}

export default ContactForm;
