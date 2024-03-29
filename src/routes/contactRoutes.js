const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const authenticate = require('../middleware/authenticate'); // Create a middleware for authentication

// Define the registration route
router.post('/contact', authenticate, contactController.addContact);
router.get('/contact', authenticate, contactController.getContact);

module.exports = router;
