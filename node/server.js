/**
 * University Shuttle Tracking System - Production Backend with MongoDB
 */

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();
const PORT = process.env.PORT || 10000;


const app = express();

// Global Middleware Configs
app.use(cors());
app.use(express.json());

// System Architecture Configurations
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;

/* ==========================================================================
   1. DATABASE PIPELINE CONFIGURATION & CONNECTION
   ========================================================================== */
if (!MONGODB_URI) {
    console.error("FATAL ERROR: MONGODB_URI configuration parameter is missing in .env file.");
    process.exit(1);
}

mongoose.connect(MONGODB_URI)
    .then(() => console.log("Database Engine Status: Successfully connected to MongoDB Atlas Cloud Cluster."))
    .catch((error) => {
        console.error("Database Engine Connection Failure:", error.message);
        process.exit(1);
    });

/* ==========================================================================
   2. DATA STRUCTURING SCHEMA DEFINITION
   ========================================================================== */
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Compile schema into an operational data model
const User = mongoose.model('User', userSchema);

/* ==========================================================================
   3. SECURE USER REGISTRATION WITH DATABASE WRITE
   ========================================================================== */
app.post('/api/register', async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'All registration fields are required.' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Database Query: Check if email already occupies a document inside the cluster
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(400).json({ message: 'This email footprint is already registered.' });
        }

        // Security Step: Hash password securely
        const hashedPassword = await bcrypt.hash(password, 10);

        // Instantiating database document payload object matching the model
        const newUser = new User({
            fullName,
            email: normalizedEmail,
            password: hashedPassword
        });

        // Write block directly onto remote cloud instance cluster disk space
        await newUser.save();

        res.status(201).json({ message: 'Profile created and stored securely!' });
    } catch (error) {
        console.error("Registration endpoint processing failure:", error);
        res.status(500).json({ message: 'Internal Server Error processing database insertion.' });
    }
});

/* ==========================================================================
   3.5 QUICK TEST ROUTE (confirms server is reachable + responding)
   ========================================================================== */
app.get('/api/test', (req, res) => {
    res.json({
        message: "Server is alive",
        dbState: mongoose.connection.readyState // 1 = connected, 0 = disconnected, 2 = connecting, 3 = disconnecting
    });
});

/* ==========================================================================
   4. SECURE SIGN-IN ROUTE WITH MONGODB READ VERIFICATION
   ========================================================================== */
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password fields are mandatory.' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Database Query: Pull active profile containing target account email values
        const user = await User.findOne({ email: normalizedEmail });

        // General uniform message fallback shields backend information profiles from scanners
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials. Please verify details.' });
        }

        // Cryptographic password confirmation
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials. Please verify details.' });
        }

        // Issue encrypted session JWT passport key
        const token = jwt.sign(
            { userId: user._id, email: user.email, name: user.fullName },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({
            message: 'Authentication validated against cloud document registries!',
            token: token,
            user: { fullName: user.fullName, email: user.email }
        });
    } catch (error) {
        console.error("Authentication endpoint processing failure:", error);
        res.status(500).json({ message: 'Internal Server Error executing validation.' });
    }
});

/* ==========================================================================
   5. START SERVER (fixed: no shadowed PORT, logs confirmation)
   ========================================================================== */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
