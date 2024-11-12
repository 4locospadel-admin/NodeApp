const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Handle any routes that don't match the API routes by serving `index.html`
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});