const express = require('express');
const router = express.Router();

// Controllers
const { compile } = require('../controllers/Compile');

// Routes
router.post('/', compile);

module.exports = router;