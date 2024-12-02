require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

// Routes
const dataRoutes = require('./routes/DataRoutes');
const authRoutes = require('./routes/authRoutes');
const salesRoutes = require('./routes/salesRoutes');

// Middleware
const requireAuth = require('./middleware/authMiddleware');

const app = express();
app.use(cookieParser());

// Middleware Setup

app.use(cors({
    origin: 'http://127.0.0.1:5500', 
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    credentials: true, 
}));



app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
mongoose.connect(process.env.DB_URI)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('Connected to the database...');
            console.log('Listening on port ', process.env.PORT);
        });
    })
    .catch(err => {
        console.log(err);
    });

// Routes

const requestMapper = '/api/v1';

// Auth routes
app.use(requestMapper + '/auth', authRoutes); // Authentication routes
console.log('Auth routes registered at /api/v1/auth');

app.use(requestMapper + '/sales', salesRoutes);

// Data routes (protected with requireAuth middleware)
app.use(requestMapper + '/data',  dataRoutes); // Protected route for data

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: "No such method exists" });
});
