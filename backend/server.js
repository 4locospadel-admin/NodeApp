const express = require('express');
const path = require('path');
const { connectToDatabase } = require('./dbConnection');
const app = express();
const PORT = process.env.PORT || 8080;

const userController = require('./userController');

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Handle any requests that don’t match the API routes by serving index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

connectToDatabase()
    .then(pool => {
        // Database connection established
        // You can now use the pool object to perform database operations

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.error('Failed to connect to the database:', err);
        process.exit(1);
    });
