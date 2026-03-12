const Order = require('../models/Order');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const addOrderItems = async (req, res) => {
    const { orderItems, totalPrice, shippingAddress, restaurantId } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
        return;
    } else if (!restaurantId) {
        res.status(400);
        throw new Error('Restaurant ID is required');
        return;
    } else {
        const order = new Order({
            orderItems,
            user: req.user._id,
            restaurantId,
            totalPrice,
            shippingAddress
        });

        const createdOrder = await order.save();

        res.status(201).json(createdOrder);
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name').sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        // Option to verify if the the restaurant owns this, but for now admin/restaurant middleware will handle general protection
        order.status = req.body.status;
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Get logged in restaurant orders
// @route   GET /api/orders/restaurant
// @access  Private/Restaurant
const getRestaurantOrders = async (req, res) => {
    const orders = await Order.find({ restaurantId: req.user._id })
        .populate('user', 'id name')
        .sort({ createdAt: -1 });
    res.json(orders);
};

// @desc    Cancel an order within 5 minutes
// @route   PUT /api/orders/:id/cancel
// @access  Private/User
const cancelOrder = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error('Order not found');
    }

    if (order.user.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error('Not authorized to cancel this order');
    }

    if (order.status !== 'Pending') {
        res.status(400);
        throw new Error('Only Pending orders can be cancelled');
    }

    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - new Date(order.createdAt).getTime() > fiveMinutes) {
        res.status(400);
        throw new Error('Cancellation window (5 minutes) has expired');
    }

    order.status = 'Cancelled';
    const updatedOrder = await order.save();
    res.json(updatedOrder);
};

module.exports = { addOrderItems, getMyOrders, getOrders, updateOrderStatus, getRestaurantOrders, cancelOrder };
