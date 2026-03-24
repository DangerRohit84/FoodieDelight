const express = require('express');
const router = express.Router();
const { getAdminAnalytics, getRestaurantAnalytics } = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/admin', protect, admin, getAdminAnalytics);
router.get('/restaurant', protect, getRestaurantAnalytics);

module.exports = router;
