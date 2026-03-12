const mongoose = require('mongoose');

const foodSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    foodType: {
        type: String,
        enum: ['Veg', 'Non-Veg'],
        default: 'Veg'
    },
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // older foods won't have it, but for new ones we set it if it's a restaurant
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const Food = mongoose.model('Food', foodSchema);
module.exports = Food;
