const express = require('express');
const app = express();
const cors = require('cors');

// Parse incoming JSON into objects
app.use(express.json());

// Environment variables
require('dotenv').config();

// Enable CORS for all routes
app.use(cors());

// Routes
const compileRoute = require('./routes/Compile');

// Use Routes
app.use('/api/v1/compile', compileRoute);

const port = process.env.PORT || 4000;

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});