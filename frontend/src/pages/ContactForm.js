import React, { useState, useEffect } from 'react';
import './ContactForm.css';

function ContactForm() {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Question');
  const [receiveNotifications, setReceiveNotifications] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [placeholder, setPlaceholder] = useState('Write us anything');
  const [inquiries, setInquiries] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'updatedDate', direction: 'desc' });

  // Fetch inquiries from the backend API
  useEffect(() => {
    fetch('/api/inquiries')
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setInquiries(data);
      })
      .catch((error) => console.error('Error fetching inquiries:', error));
  }, []);

  const handleSave = () => {
    if (!email || !subject || !message) {
      alert('Please fill out all fields before saving.');
      return;
    }
    const inquiry = { email, category, subject, message };
    console.log('Saved Inquiry:', inquiry);
    // Add save logic here (e.g., API call to backend)
  };

  const toggleExpandRow = (Id) => {
    setInquiries((prevInquiries) =>
      prevInquiries.map((inquiry) =>
        inquiry.Id === Id ? { ...inquiry, isExpanded: !inquiry.isExpanded } : inquiry
      )
    );
  };

  const sortInquiries = (key) => {
    const newDirection =
      sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction: newDirection });

    setInquiries((prevInquiries) =>
      [...prevInquiries].sort((a, b) => {
        if (a[key] < b[key]) return newDirection === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return newDirection === 'asc' ? 1 : -1;
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
          <small>{500 - message.length} characters remaining</small>
        </div>

        <button onClick={handleSave} className="save-button">Save</button>
      </div>

      <h2>Support Inquiries</h2>
      <div className="inquiry-list">
        <div className="inquiry-header">
          <span onClick={() => sortInquiries('Subject')}>Subject</span>
          <span onClick={() => sortInquiries('Status')}>Status</span>
        </div>
        {inquiries.map((inquiry) => (
          <div key={inquiry.Id} className="inquiry-row">
            <div className="inquiry-summary">
              <span>{inquiry.Subject}</span>
              <span>{inquiry.Status}</span>
              <button onClick={() => toggleExpandRow(inquiry.Id)}>
                {inquiry.isExpanded ? '▲' : '▼'}
              </button>
            </div>
            {inquiry.isExpanded && (
              <div className="inquiry-details">
                <p><strong>Message:</strong> {inquiry.Description}</p>
                <p><strong>Response:</strong> {inquiry.Answer || 'No response yet'}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactForm;