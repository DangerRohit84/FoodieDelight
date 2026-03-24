const Order = require('../models/Order');
const User = require('../models/User');
const Food = require('../models/Food');
const mongoose = require('mongoose');

// @desc    Get global analytics for admin
// @route   GET /api/analytics/admin
// @access  Private/Admin
const getAdminAnalytics = async (req, res) => {
    try {
        const totalRevenue = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        const orderStats = await Order.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const userCount = await User.countDocuments();
        const restaurantCount = await User.countDocuments({ role: 'restaurant' });

        // Last 7 days revenue trend
        const days = parseInt(req.query.days) || 7;
        const dateRange = new Date();
        dateRange.setDate(dateRange.getDate() - days);

        const revenueTrend = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: dateRange },
                    status: { $ne: 'Cancelled' }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalPrice" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Specific metrics: Today vs Yesterday
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const startOfYesterday = new Date();
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        startOfYesterday.setHours(0, 0, 0, 0);

        const todayRevenue = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfToday }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        const yesterdayRevenue = await Order.aggregate([
            { 
                $match: { 
                    createdAt: { $gte: startOfYesterday, $lt: startOfToday }, 
                    status: { $ne: 'Cancelled' } 
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        res.json({
            stats: {
                totalRevenue: totalRevenue[0]?.total || 0,
                todayRevenue: todayRevenue[0]?.total || 0,
                yesterdayRevenue: yesterdayRevenue[0]?.total || 0,
                totalOrders: await Order.countDocuments(),
                totalUsers: userCount,
                totalRestaurants: restaurantCount
            },
            orderStats,
            revenueTrend: revenueTrend.map(item => ({ name: item._id, value: item.revenue }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get restaurant specific analytics
// @route   GET /api/analytics/restaurant
// @access  Private/Restaurant
const getRestaurantAnalytics = async (req, res) => {
    try {
        const restaurantId = new mongoose.Types.ObjectId(req.user._id);

        const totalRevenue = await Order.aggregate([
            { $match: { restaurantId, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        const orderStats = await Order.aggregate([
            { $match: { restaurantId } },
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // Top 5 selling items
        const topSellingItems = await Order.aggregate([
            { $match: { restaurantId, status: 'Delivered' } },
            { $unwind: '$orderItems' },
            {
                $group: {
                    _id: '$orderItems.name',
                    qty: { $sum: '$orderItems.qty' }
                }
            },
            { $sort: { qty: -1 } },
            { $limit: 5 }
        ]);

        const days = parseInt(req.query.days) || 7;
        const dateRange = new Date();
        dateRange.setDate(dateRange.getDate() - days);

        const revenueTrend = await Order.aggregate([
            { 
                $match: { 
                    restaurantId,
                    createdAt: { $gte: dateRange },
                    status: { $ne: 'Cancelled' }
                } 
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalPrice" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Specific metrics: Today vs Yesterday
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const startOfYesterday = new Date();
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        startOfYesterday.setHours(0, 0, 0, 0);

        const todayRevenue = await Order.aggregate([
            { $match: { restaurantId, createdAt: { $gte: startOfToday }, status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        const yesterdayRevenue = await Order.aggregate([
            { 
                $match: { 
                    restaurantId,
                    createdAt: { $gte: startOfYesterday, $lt: startOfToday }, 
                    status: { $ne: 'Cancelled' } 
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);

        res.json({
            stats: {
                totalRevenue: totalRevenue[0]?.total || 0,
                todayRevenue: todayRevenue[0]?.total || 0,
                yesterdayRevenue: yesterdayRevenue[0]?.total || 0,
                totalOrders: await Order.countDocuments({ restaurantId }),
                topItemsCount: topSellingItems.length
            },
            orderStats,
            topSellingItems: topSellingItems.map(item => ({ name: item._id, value: item.qty })),
            revenueTrend: revenueTrend.map(item => ({ name: item._id, value: item.revenue }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAdminAnalytics,
    getRestaurantAnalytics
};
