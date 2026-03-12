const express = require('express');
const router = express.Router();
const multer = require('multer');
const { getFoods, createFood, updateFood, deleteFood, importFoods, getMyFoods, toggleFoodAvailability } = require('../controllers/foodController');
const { protect, admin, restaurantOrAdmin } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.route('/')
    .get(getFoods)
    .post(protect, restaurantOrAdmin, createFood);

router.get('/myfoods', protect, restaurantOrAdmin, getMyFoods);

router.post('/import', protect, restaurantOrAdmin, upload.single('file'), importFoods);

router.route('/:id').put(protect, restaurantOrAdmin, updateFood).delete(protect, restaurantOrAdmin, deleteFood);

router.put('/:id/availability', protect, restaurantOrAdmin, toggleFoodAvailability);

module.exports = router;
