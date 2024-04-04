const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authenticateAdmin = require('../middleware/authenticateAdmin'); // Create a middleware for authentication

// Define the registration route
router.get('/employee', adminController.getEmployeeList);

// Define the ADMIN registration route
router.post('/register', adminController.register);
// Define the ADMIN login route
router.post('/login', adminController.login);
router.get('/me', adminController.me);


module.exports = router;
