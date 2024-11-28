const express = require('express');
const path = require('path');
const { connectToDatabase } = require('./dbConnection');
const userController = require('./userController');
const inquiryController = require('./inquiryController');

require('dotenv').config(({ override: true }));

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// API routes
app.use('/api', userController);
app.use('/api', inquiryController);

// Handle any requests that don’t match the API routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Connect to the database and start the server
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

