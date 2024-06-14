const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const employeeController = require('../controllers/employeeController');
const authenticateAdmin = require('../middleware/authenticateAdmin'); // Create a middleware for authentication

// Define the registration route
router.get('/employee', authenticateAdmin, adminController.getEmployeeList);
router.get('/contact', authenticateAdmin, adminController.getContact);
router.get('/employee/clockin/:id', authenticateAdmin, adminController.getClockinList);
router.get('/employee/worklist/:id', authenticateAdmin, adminController.getWorkList);

// Define the ADMIN registration route
router.post('/register', adminController.register);
router.post('/updateAdmin', adminController.updateAdmin);
router.post('/updateEmployee', employeeController.updateEmployee);
// Define the ADMIN login route
router.post('/login', adminController.login);
router.get('/me', authenticateAdmin, adminController.me);


module.exports = router;
