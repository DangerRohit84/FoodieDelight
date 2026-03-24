const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderItems: [
        {
            name: { type: String, required: true },
            qty: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            food: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Food',
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    shippingAddress: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        phone: { type: String, required: true }
    },
    status: {
        type: String,
        enum: ['Pending', 'Processing', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled', 'Rejected', 'Failed'],
        default: 'Pending'
    },
    paymentMethod: {
        type: String,
        required: true,
        default: 'Online'
    },
    isPaid: {
        type: Boolean,
        required: true,
        default: false
    },
    paidAt: {
        type: Date
    },
    paymentResult: {
        id: { type: String },
        status: { type: String },
        update_time: { type: String },
        email_address: { type: String }
    }
}, {
    timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
