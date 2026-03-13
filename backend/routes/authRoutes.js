const express = require('express');
const router = express.Router();
const { registerUser, authUser, forgotPassword, resetPassword, sendOtp, testEmailSetup } = require('../controllers/authController');

router.get('/test-email', testEmailSetup);

router.post('/send-otp', sendOtp);
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
