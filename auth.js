const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const { authorizeRole, authenticateToken } = require("../middlewares/auth");

const router = express.Router();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';

router.post('/register', async (req, res) => {
    try {
        const { username, password, firstName, lastName, age, gender, email } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const twoFASecret = speakeasy.generateSecret({
            name: `Portfolio (${username})`,
        });

        const newUser = new User({
            username,
            password: hashedPassword,
            firstName,
            lastName,
            age,
            gender,
            twoFASecret: twoFASecret.base32,
            email,
        });

        await newUser.save();

        const otpauthUrl = twoFASecret.otpauth_url;
        const qrCode = await QRCode.toDataURL(otpauthUrl, { width: 300, height: 300 });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Welcome to Portfolio!',
            text: `Hello ${firstName}, welcome to Portfolio!`,
        });

        res.status(201).json({
            message: 'User registered successfully',
            qrCode,
        });
    } catch (error) {
        console.error(error);

        if (error.code === 11000) {
            const duplicateField = Object.keys(error.keyValue)[0];
            res.status(400).json({
                error: `${duplicateField[0].toUpperCase() + duplicateField.slice(1)} already exists.`,
            });
        } else {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
});

router.post('/login', async (req, res) => {
    try {
        const { username, password, twoFACode } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        if (user.twoFASecret) {
            if (!twoFACode) {
                return res.status(400).json({ error: '2FA code is required' });
            }

            const isCodeValid = speakeasy.totp.verify({
                secret: user.twoFASecret,
                encoding: 'base32',
                token: twoFACode,
            });

            if (!isCodeValid) {
                return res.status(401).json({ error: 'Invalid 2FA code' });
            }
        }

        const accessToken = jwt.sign({ userId: user._id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ userId: user._id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

        res.status(200).json({
            accessToken,
            refreshToken,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/profile', authenticateToken, async (req, res) => {
    try {
        console.log('Authenticated User ID:', req.user.userId);

        const user = await User.findById(req.user.userId).select('-password -twoFASecret');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/admin', authenticateToken, authorizeRole(['admin']), (req, res) => {
    res.json({ message: 'Welcome, Admin! You can manage content here.' });
});

router.get('/editor', authenticateToken, authorizeRole(['editor', 'admin']), (req, res) => {
    res.json({ message: 'Welcome, Editor! You can contribute content here.' });
});

module.exports = router;
