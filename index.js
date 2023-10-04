const express = require('express');
const app = express();

// Parse incoming JSON into objects
app.use(express.json());

// Environment variables
require('dotenv').config();     

const port = process.env.PORT || 3000;

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});