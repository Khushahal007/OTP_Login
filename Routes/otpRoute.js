const express = require('express');
const otpGenerator = require('otp-generator');
const nodemailer = require('nodemailer');
const User = require('../Model/userModel');

const router = express.Router();

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'paul90@ethereal.email',
        pass: 'mwVvfxE4YxD3QKGfvn',
    },
});

router.post('/', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const user = await User.findOne({ email });

        // If the user doesn't exist, create a new user
        if (!user) {
            await User.create({ email });
        } else {
            // Check the time difference between the last OTP generation and the current request
            const timeDifference = new Date() - user.otpGeneratedAt;
            const minuteDifference = Math.floor(timeDifference / (1000 * 60)); // Convert milliseconds to minutes

            // If the minimum 1-minute gap is not met, return an error
            if (minuteDifference < 1) {
                return res.status(400).json({ message: 'Please wait one minute for resend otp' });
            }
        }

        // Generate a new OTP
        const otp = otpGenerator.generate(6, { digits: true, alphabets: false, upperCase: false });

        // Update the user's OTP and OTP generated timestamp
        await User.updateOne(
            { email },
            {
                otp,
                otpGeneratedAt: new Date(),
                otpAttempts: 0,
                otpBlockedUntil: null,
            }
        );

        // Send OTP to the user's email
        await transporter.sendMail({
            from: 'paul90@ethereal.email',
            to: email,
            subject: 'OTP Verification',
            text: `Your OTP is: ${otp}`,
        });

        res.status(200).json({ message: 'OTP generated successfully. Check your email.' });
    } catch (error) {
        console.error('Error generating OTP:', error);
        res.status(500).json({ message: 'Failed to generate OTP. Please try again later.' });
    }
});

module.exports = router;
