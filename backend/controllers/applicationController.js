const RestaurantApplication = require('../models/RestaurantApplication');
const OTP = require('../models/OTP');
const { cloudinary } = require('../config/cloudinary');

// @desc    Submit a new restaurant application
// @route   POST /api/applications
// @access  Public
const submitApplication = async (req, res) => {
    const { restaurantName, ownerName, email, phone, otp } = req.body;

    if (!req.file) {
        return res.status(400).json({ message: 'Document upload is required' });
    }

    if (!otp) {
        if (req.file) await cloudinary.uploader.destroy(req.file.filename);
        return res.status(400).json({ message: 'OTP is required' });
    }

    const validOtp = await OTP.findOne({ email, otp });
    if (!validOtp) {
        if (req.file) await cloudinary.uploader.destroy(req.file.filename);
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await OTP.deleteOne({ _id: validOtp._id });

    const application = new RestaurantApplication({
        restaurantName,
        ownerName,
        email,
        phone,
        documentPath: req.file.path.replace(/\\/g, '/') // Ensure forward slashes for URLs
    });

    const createdApp = await application.save();
    res.status(201).json(createdApp);
};

// @desc    Get all applications
// @route   GET /api/applications
// @access  Private/Admin
const getApplications = async (req, res) => {
    const apps = await RestaurantApplication.find({}).sort({ createdAt: -1 });
    res.json(apps);
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
const updateApplicationStatus = async (req, res) => {
    const { status, rejectReason } = req.body;
    const application = await RestaurantApplication.findById(req.params.id);

    if (application) {
        application.status = status;
        const updatedApp = await application.save();

        // If approved, create a restaurant user account and send an email
        if (status === 'Approved') {
            const User = require('../models/User');
            const sendEmail = require('../utils/sendEmail');
            const crypto = require('crypto');

            // Check if user already exists
            const existingUser = await User.findOne({ email: application.email });
            if (!existingUser) {
                // Generate a secure 8-character temporary password
                const tempPassword = crypto.randomBytes(4).toString('hex');
                
                const newUser = await User.create({
                    name: application.restaurantName,
                    email: application.email,
                    password: tempPassword,
                    role: 'restaurant',
                    phone: application.phone
                });

                // Send welcome email with credentials
                const message = `
                    Hello ${application.ownerName},
                    
                    Your restaurant application for "${application.restaurantName}" has been approved!
                    
                    You can now log in to the Partner Dashboard using these credentials:
                    Email: ${application.email}
                    Temporary Password: ${tempPassword}
                    
                    Please log in and change your password immediately in your Profile section.
                    
                    Welcome to FoodieDelight!
                `;

                try {
                    await sendEmail({
                        email: application.email,
                        subject: 'Application Approved - Partner Credentials',
                        message
                    });
                } catch (error) {
                    console.error('Email could not be sent', error);
                }
            }
        } else if (status === 'Rejected') {
            const sendEmail = require('../utils/sendEmail');
            const message = `
                Dear ${application.ownerName},
                
                We regret to inform you that your application to partner with us for "${application.restaurantName}" has been declined at this time.
                
                Reason for rejection:
                ${rejectReason || 'Your application did not meet our requirements or your documents were unclear.'}
                
                If you have any questions or would like to submit a revised application, please re-apply on our portal.
                
                Best regards,
                FoodieDelight Team
            `;

            try {
                await sendEmail({
                    email: application.email,
                    subject: 'Partner Application Update',
                    message
                });
            } catch (error) {
                console.error('Email could not be sent', error);
            }
        }

        res.json(updatedApp);
    } else {
        res.status(404).json({ message: 'Application not found' });
    }
};

module.exports = { submitApplication, getApplications, updateApplicationStatus };
