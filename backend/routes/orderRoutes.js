const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getOrders, updateOrderStatus, getRestaurantOrders, cancelOrder } = require('../controllers/orderController');
const { protect, admin, restaurantOrAdmin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/restaurant').get(protect, restaurantOrAdmin, getRestaurantOrders);
router.route('/:id/status').put(protect, restaurantOrAdmin, updateOrderStatus);
router.route('/:id/cancel').put(protect, cancelOrder);

module.exports = router;
