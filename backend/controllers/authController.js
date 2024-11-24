const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper function to create a token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '3d' });
};

// Register User
const registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already exists" });
        }

        const user = new User({ username, password });
        await user.save(); // Password will be hashed by the pre('save') hook

        const token = createToken(user._id);

        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });

        res.status(201).json({ message: "User registered successfully", token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Compare entered password with the hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Create and set token in HTTP-only cookie
        const token = createToken(user._id);
        res.cookie('jwt', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Logout User
const logoutUser = (req, res) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1, // Clear immediately
    });
    res.status(200).json({ message: 'User logged out successfully. Please log in again to continue.' });
};

// Update Password
const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Both current and new passwords are required" });
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[-_!@#$%^&*])(?=.*\d).{6,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
            error: "New password must be at least 6 characters long, contain one uppercase letter, one special character, and one number",
        });
    }

    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Current password is incorrect" });
        }

        // Update password directly (pre-save hook will handle hashing)
        user.password = newPassword;
        await user.save();

        console.log("Updated password hash:", user.password); // Debugging

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Error updating password:", err);
        res.status(500).json({ error: "Something went wrong" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    updatePassword,
};
