# Padel Court Reservation System

This project is a **Padel Court Reservation System** that provides a user-friendly web application for managing padel court reservations and inquiries. It is designed for both **users** (players) and **administrators** to streamline the reservation and inquiry handling processes.

---

## Features

### Reservations
- **Users**
  - View available courts and times.
  - Create new reservations with a configurable duration.
  - View and manage personal reservations.
  - Cancel reservations with a reason, if allowed.
- **Admins**
  - View all reservations across all users.
  - Cancel reservations with a reason.

### Inquiries
- Submit inquiries with the following details:
  - Category (e.g., Question, Damage, Complaint, etc.).
  - Subject and description.
  - Option to receive notifications about responses.
- View past inquiries with options to:
  - Sort inquiries by subject, status, or creation date.
  - Expand inquiries to view details.
  - Edit inquiry responses and update statuses (**admin only**).

### Notifications
- Users receive email notifications with summaries of their inquiries and responses.
- Reservation confirmation emails include an iCalendar event for easy calendar integration.

---

## Technologies

### Frontend
- **React.js**: Built with a modular React.js architecture.
- **React DatePicker**: For selecting reservation dates.

### Backend
- **Node.js**: Backend server handling API requests.
- **Express.js**: RESTful API framework.
- **SQL Server**: Database for storing user, reservation, and inquiry data.

### Email Notifications
- **Nodemailer**: Sends email notifications for inquiries and reservations.

---

## Setup Instructions

### Prerequisites
1. **Node.js**: Install Node.js (v16 or later recommended).
2. **SQL Server**: Ensure an SQL Server instance is set up.
3. **Environment Variables**:
   - Create a `.env` file with the following keys:
     ```env
     DB_HOST=<Your Database Host>
     DB_USER=<Your Database User>
     DB_PASSWORD=<Your Database Password>
     DB_NAME=<Your Database Name>
     EMAIL=<Your SMTP Email Address>
     EMAIL_PASSWORD=<Your SMTP Email Password>
     ```
4. **React Setup**: Ensure a modern browser is available for React.

---

### Installation

#### Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
