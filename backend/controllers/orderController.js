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
    const orders = await Order.find({ user: req.user._id })
        .populate('restaurantId', 'name')
        .sort({ createdAt: -1 });
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

        // Auto-update COD payment to paid on delivery
        if (req.body.status === 'Delivered' && order.paymentMethod === 'Cash on Delivery' && !order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
        }

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

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
// @access  Private
const updateOrderToPaid = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'Processing';
        order.paymentResult = {
            id: req.body.id || 'MOCK_PYMT_' + Math.random().toString(36).substring(7),
            status: req.body.status || 'captured',
            update_time: req.body.update_time || new Date().toISOString(),
            email_address: req.body.email_address || req.user.email,
        };

        const updatedOrder = await order.save();

        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update order to failed
// @route   PUT /api/orders/:id/fail
// @access  Private
const updateOrderToFailed = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = 'Failed';
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

// @desc    Update order to COD
// @route   PUT /api/orders/:id/cod
// @access  Private
const updateOrderToCOD = async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.paymentMethod = 'Cash on Delivery';
        order.status = 'Processing';
        order.isPaid = false; // COD is not paid until delivery
        
        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
};

module.exports = { addOrderItems, getMyOrders, getOrders, updateOrderStatus, getRestaurantOrders, cancelOrder, updateOrderToPaid, updateOrderToFailed, updateOrderToCOD };
