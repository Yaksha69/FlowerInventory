const jwt = require('jsonwebtoken');

// Function to generate a JWT token
const createToken = (userId) => {
    const secret = process.env.JWT_SECRET; // Fetch secret key from environment
    return jwt.sign({ id: userId }, secret, { expiresIn: '1d' }); // Token expires in 1 day
};

module.exports = createToken;
