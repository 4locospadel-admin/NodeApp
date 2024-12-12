/**
 * @file server.js
 * @description Entry point for the server application. Configures the Express app, connects to the database, and serves API routes and static files.
 */

const express = require('express');
const path = require('path');
const { connectToDatabase } = require('./dbConnection');
const userController = require('./controllers/userController');
const inquiryController = require('./controllers/inquiryController');
const reservationController = require('./controllers/reservationController');

require('dotenv').config(({ override: true }));

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * Middleware to parse JSON request bodies.
 */
app.use(express.json());

/**
 * Serves the static files from the React build directory.
 * The React app's `index.html` is served for non-API requests.
 */
app.use(express.static(path.join(__dirname, 'build')));

/**
 * API Routes.
 * Routes are grouped and imported from controllers.
 */
app.use('/api', userController);
app.use('/api', inquiryController);
app.use('/api', reservationController)

/**
 * Catch-all route to serve the React app for any undefined route.
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

/**
 * Connects to the database and starts the server.
 * If the database connection fails, the server exits with an error.
 */
connectToDatabase()
  .then(pool => {
    // Database connection established
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to the database:', err);
    process.exit(1);
  });

