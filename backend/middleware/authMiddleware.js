const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
    const token = req.cookies.jwt; // Get token from cookies
    if (!token) {
        return res.status(401).json({ error: 'Authorization token is missing' });
    }

    try {
        // Decode token and fetch the user ID
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        
        // Fetch the user based on the ID
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        req.user = user; // Attach user info to the request
        next();
    } catch (err) {
        console.error('Authorization error:', err.message);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};

module.exports = requireAuth;
