const express = require('express');
const { registerUser, loginUser, logoutUser, updatePassword } = require('../controllers/authController');
const requireAuth = require('../middleware/authMiddleware');


const router = express.Router();

// Register route
router.post('/register', registerUser);

// Login route
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Modify route
router.patch('/update-password', requireAuth, updatePassword);

module.exports = router;
