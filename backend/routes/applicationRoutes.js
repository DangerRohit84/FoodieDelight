const express = require('express');
const router = express.Router();
const multer = require('multer');
const { submitApplication, getApplications, updateApplicationStatus } = require('../controllers/applicationController');
const { protect, admin } = require('../middleware/authMiddleware');
const { storage } = require('../config/cloudinary');

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

const upload = multer({ storage, fileFilter });

router.route('/')
    .post(upload.single('document'), submitApplication)
    .get(protect, admin, getApplications);

router.route('/:id/status')
    .put(protect, admin, updateApplicationStatus);

module.exports = router;
