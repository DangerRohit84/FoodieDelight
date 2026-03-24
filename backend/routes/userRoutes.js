const express = require('express');
const router = express.Router();
const {
    getUserProfile,
    addAddress,
    updateUserProfile,
    deleteAddress,
    deleteUser,
    deactivateUser,
    updateAddress,
    toggleFavorite
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.route('/profile')
    .get(protect, getUserProfile)
    .put(protect, updateUserProfile)
    .delete(protect, deleteUser);

router.put('/deactivate', protect, deactivateUser);

router.route('/address').post(protect, addAddress);
router.route('/address/:id')
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

module.exports = router;
