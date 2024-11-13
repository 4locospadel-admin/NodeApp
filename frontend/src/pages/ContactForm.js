import React, { useState } from 'react';

function ContactForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [inquiries, setInquiries] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name && description) {
      const newInquiry = { name, description };
      setInquiries([...inquiries, newInquiry]);
      setName('');
      setDescription('');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit">Send</button>
      </form>
      <h2>Inquiries:</h2>
      <ul>
        {inquiries.map((inquiry, index) => (
          <li key={index}>
            <strong>{inquiry.name}:</strong> {inquiry.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ContactForm;