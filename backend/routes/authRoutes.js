const express = require('express');
const { registerUser, loginUser, logoutUser, changePassword} = require('../controllers/authController');
const requireAuth = require('../middleware/authMiddleware');
const verifyToken = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const AuthController = require('../controllers/authController'); // Adjust the path as needed


const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', authController.loginUser);
router.post('/logout', logoutUser);

// Modify route

// Protect the password change route
router.put('/change-password', requireAuth, AuthController.changePassword);


module.exports = router;
