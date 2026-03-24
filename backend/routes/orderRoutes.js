const express = require('express');
const router = express.Router();
const { addOrderItems, getMyOrders, getOrders, updateOrderStatus, getRestaurantOrders, cancelOrder, updateOrderToPaid, updateOrderToFailed, updateOrderToCOD } = require('../controllers/orderController');
const { protect, admin, restaurantOrAdmin } = require('../middleware/authMiddleware');

router.route('/').post(protect, addOrderItems).get(protect, admin, getOrders);
router.route('/myorders').get(protect, getMyOrders);
router.route('/restaurant').get(protect, getRestaurantOrders);
router.route('/:id/status').put(protect, restaurantOrAdmin, updateOrderStatus);
router.route('/:id/cancel').put(protect, cancelOrder);
router.route('/:id/pay').put(protect, updateOrderToPaid);
router.route('/:id/fail').put(protect, updateOrderToFailed);
router.route('/:id/cod').put(protect, updateOrderToCOD);

module.exports = router;
