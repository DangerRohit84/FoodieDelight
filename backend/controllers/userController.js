const User = require('../models/User');

// @desc    Get user profile (including addresses)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            gender: user.gender,
            phone: user.phone,
            addresses: user.addresses,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.gender = req.body.gender || user.gender;
        user.phone = req.body.phone || user.phone;
        if (req.body.password) {
            if (!req.body.oldPassword) {
                res.status(400);
                throw new Error('Current password is required to set a new password');
            }
            if (!(await user.matchPassword(req.body.oldPassword))) {
                res.status(401);
                throw new Error('Incorrect current password');
            }
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            gender: updatedUser.gender,
            phone: updatedUser.phone,
            addresses: updatedUser.addresses,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Add new address
// @route   POST /api/users/address
// @access  Private
const addAddress = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { label, address, city, postalCode, country, phone } = req.body;
        // Basic validation
        if (!address || !phone) {
            res.status(400);
            throw new Error('Address and Phone number are required');
        }

        user.addresses.push({ label: label || 'HOME', address, city, postalCode, country, phone });
        const updatedUser = await user.save();
        res.json(updatedUser.addresses);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Delete address
// @route   DELETE /api/users/address/:id
// @access  Private
const deleteAddress = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
        await user.save();
        res.json({ message: 'Address removed', addresses: user.addresses });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
const deleteUser = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        await user.deleteOne();
        res.json({ message: 'User deleted successfully' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Deactivate user account
// @route   PUT /api/users/deactivate
// @access  Private
const deactivateUser = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.isActive = false; // Assuming isActive field exists or will be added
        await user.save();
        res.json({ message: 'Account deactivated' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Update existing address
// @route   PUT /api/users/address/:id
// @access  Private
const updateAddress = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const addressIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.id);

        if (addressIndex !== -1) {
            user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...req.body };
            const updatedUser = await user.save();
            res.json(updatedUser.addresses);
        } else {
            res.status(404);
            throw new Error('Address not found');
        }
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

module.exports = {
    getUserProfile,
    addAddress,
    updateUserProfile,
    deleteAddress,
    deleteUser,
    deactivateUser,
    updateAddress
};
