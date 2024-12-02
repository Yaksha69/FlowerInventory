const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to create a token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

// Registration
const registerUser = async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({ username, password: hashedPassword });
        await user.save();

        const token = createToken(user._id);

        res.status(201).json({ message: "User registered successfully", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Login
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials: User not found' });
        }

        // Compare password with stored hash
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ error: 'Invalid credentials: Incorrect password' });
        }

        const token = createToken(user._id);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
            path: '/',
        });

        res.json({ message: 'Login successful!' });
    } catch (err) {
        res.status(500).json({ error: 'Server error during login' });
    }
};

// Logout User
const logoutUser = (req, res) => {
    res.clearCookie('jwt', { path: '/', httpOnly: true, secure: true, sameSite: 'Strict' });
    res.status(200).json({ message: 'User logged out successfully.' });
};

// Change Password
const changePassword = async (req, res) => {
    const { currentPassword, password } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const match = await bcrypt.compare(currentPassword, user.password);

        if (!match) {
            return res.status(400).json({ error: 'Incorrect current password' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedNewPassword = await bcrypt.hash(password, salt);

        user.password = hashedNewPassword;
        await user.save();

        const token = createToken(user._id);

        res.status(200).json({ message: 'Password updated successfully', token });
        
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    changePassword
};
