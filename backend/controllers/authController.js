const User = require('../models/User');
const OTP = require('../models/OTP');
const sendEmail = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const sendOtp = async (req, res) => {
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    email = email.toLowerCase();

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await OTP.deleteMany({ email });
    await OTP.create({ email, otp });

    try {
        await sendEmail({
            email,
            subject: 'FoodieDelight Verification Code',
            message: `Welcome to FoodieDelight!\n\nYour verification code is: ${otp}\n\nThis code will expire in 10 minutes.`
        });
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Email send error full details:', error);
        await OTP.deleteMany({ email });
        res.status(500).json({ message: 'Email could not be sent', error: error.message });
    }
};

const registerUser = async (req, res) => {
    let { name, email, password, role, otp } = req.body;
    if (email) email = email.toLowerCase();

    if (!otp) {
        return res.status(400).json({ message: 'OTP is required' });
    }

    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    await OTP.deleteOne({ _id: validOtp._id });

    let selectedRole = 'user';
    if (role === 'restaurant') selectedRole = 'restaurant';

    const user = await User.create({
        name,
        email,
        password,
        role: selectedRole
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid user data' });
    }
};

const authUser = async (req, res) => {
    let { email, password } = req.body;
    if (email) email = email.toLowerCase();

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });
    } else {
        res.status(401).json({ message: 'Invalid email or password' });
    }
};



const forgotPassword = async (req, res) => {
    let { email } = req.body;
    if (email) email = email.toLowerCase();

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'No user found with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const frontendUrl = process.env.FRONTEND_URL || req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const message = `
        You are receiving this email because a password reset was requested for your account.
        Please click on the following link or paste it into your browser to complete the process:
        
        ${resetUrl}
        
        Note: For your security, this reset link will automatically expire in exactly 10 minutes, and can only be used once.
        
        If you did not request this, please safely ignore this email; your password will remain unchanged.
    `;

    try {
        await sendEmail({
            email: user.email,
            subject: 'FoodieDelight Password Reset',
            message
        });

        res.status(200).json({ message: 'Password reset link sent to email' });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({ message: 'Email could not be sent', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    const resetToken = req.params.token;
    
    // Hash token from param to compare with database
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
    });
};

const testEmailSetup = async (req, res) => {
    try {
        await sendEmail({
            email: process.env.SMTP_EMAIL || process.env.FROM_EMAIL,
            subject: 'FoodieDelight Render SMTP Test',
            message: `If you are reading this, your Render deployment successfully dispatched an email!\n\nDetails:\nService: ${process.env.SMTP_SERVICE}\nEmail: ${process.env.SMTP_EMAIL}`
        });

        res.status(200).json({ 
            success: true, 
            message: 'Diagnostic email successfully transmitted to the configured SMTP_EMAIL address.',
            config: {
                user: process.env.SMTP_EMAIL ? 'Set' : 'Missing',
                pass: process.env.SMTP_PASSWORD ? 'Set' : 'Missing',
            }
        });
    } catch (error) {
        console.error('SMTP Diagnostic Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'SMTP connection entirely failed.', 
            rawError: error.message,
            stack: error.stack
        });
    }
};

module.exports = { registerUser, authUser, forgotPassword, resetPassword, sendOtp, testEmailSetup };
