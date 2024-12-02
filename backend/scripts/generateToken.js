const jwt = require('jsonwebtoken');

// Token generation function
const createToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};
