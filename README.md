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

Run command 'npm run localhost'

- This will build backend and frontend, install all the dependencies from the package.json files, copy the build folder from frontend to backend and start the server. 
---

## Usage

### 1. User Login
- Log in as a **user** or **admin**.

### 2. Reservations
- Use the calendar to select a date.
- View available courts and times.
- Click on a time slot to create a reservation.
- Expand a reservation row to cancel a reservation (**users only if allowed, admins for all reservations**).

### 3. Inquiries
- Submit a new inquiry via the **Contact Us** page.
- View past inquiries and sort them by subject, status, or creation date.
- Expand inquiries to view details.
- Admins can update inquiry responses and statuses.

---

## Public API Endpoints

### Reservations
- `GET /api/reservations?email=<email>`: Get reservations for a user.
- `GET /api/reservations/day?date=<yyyy-MM-dd>`: Get reservations for a specific day.
- `POST /api/reservations`: Create a new reservation.
- `PUT /api/reservations/:id/cancel`: Cancel a reservation.

### Inquiries
- `GET /api/inquiries?email=<email>`: Get inquiries for a user.
- `POST /api/inquiries`: Submit a new inquiry.
- `PUT /api/inquiries/:id`: Update an inquiry (response or status).
