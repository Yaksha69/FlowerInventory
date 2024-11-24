const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ error: 'Authorization token is missing' });
  }

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = user; // Attach the user to the request
    next();
  } catch (err) {
    console.error('Authorization error:', err.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = requireAuth;
