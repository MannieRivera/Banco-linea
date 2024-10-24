const express = require('express');
const cors = require('cors'); // Import the cors module
const app = express();
const apiRoutes = require('./routes/api');

// Use CORS middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(express.static('public'));
app.use('/api', apiRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
