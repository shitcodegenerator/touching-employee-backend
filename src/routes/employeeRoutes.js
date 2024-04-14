const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authenticate = require('../middleware/authenticate'); // Create a middleware for authentication

// Define the registration route
router.post('/addEmployee', employeeController.addEmployee);
router.post('/login', employeeController.login);
router.post('/clockin',authenticate,  employeeController.clockin);
router.get('/me', authenticate,  employeeController.getUserData);
router.get('/clockin', authenticate,  employeeController.getClockinList);
router.post('/clockin/patch',  employeeController.clockinPatch);
router.get('/work', authenticate,  employeeController.getWorkList);
router.get('/clockin/hours', authenticate,  employeeController.getClockinHours);
router.post('/work', authenticate,  employeeController.addWorkList);

module.exports = router;
