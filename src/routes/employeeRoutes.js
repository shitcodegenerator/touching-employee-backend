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
router.get('/work', authenticate,  employeeController.getWorkList);
router.post('/work', authenticate,  employeeController.addWorkList);
// router.get('/categories', articleController.getCategories);
// // Add new Article
// router.post('/article', articleController.addArticle);

// router.get('/article/:articleId', articleController.getArticleById);
// router.post('/article/category', articleController.addCategory);

// router.post('/uploadImage', upload.single('image'), articleController.uploadImage);

// // Define a route to edit an article by its ID
// router.put('/article/:articleId', articleController.editArticle);

// // Define a route to delete an article by its ID
// router.delete('/article/:articleId', articleController.deleteArticle);

module.exports = router;
