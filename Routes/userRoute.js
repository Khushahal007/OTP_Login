const express = require('express');
const User = require('../Model/userModel');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

const router = express.Router();

router.post('/', async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });

        // If the user doesn't exist or is blocked, return an error
        if (!user || user.otpBlockedUntil > new Date()) {
            return res.status(400).json({ message: 'Invalid OTP. Please try again after 1 hour' });
        }

        // Check if the OTP is valid
        if (user.otp !== otp) {
            // Increment OTP attempts and check if the user should be blocked
            const otpAttempts = user.otpAttempts + 1;
            const blockedUntil = otpAttempts >= 5 ? new Date(Date.now() + 1 * 60 * 60 * 1000) : null;

            // Update user with new OTP attempts and blocked status if necessary
            await user.updateOne({ otpAttempts, otpBlockedUntil: blockedUntil });

            return res.status(400).json({ message: 'Invalid OTP. Please try again' });
        }

        // Check if the OTP is expired
        const otpExpiration = new Date(user.otpGeneratedAt.getTime() + 5 * 60 * 1000);
        if (otpExpiration < new Date()) {
            return res.status(400).json({ message: 'OTP has expired. Please generate a new OTP.' });
        }

        // Generate JWT token and send it back to the user
        const token = jwt.sign({ email }, process.env.JWT, { expiresIn: '1h' });

        // Clear the OTP and OTP attempts for successful login
        await user.updateOne({ otp: null, otpAttempts: 0 });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Failed to log in. Please try again later.' });
    }
});

module.exports = router;
