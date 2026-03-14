const Food = require('../models/Food');
const xlsx = require('xlsx');

// @desc    Get all food items
// @route   GET /api/foods
// @access  Public
const getFoods = async (req, res) => {
    const foods = await Food.find({}).populate('restaurantId', 'name');
    res.json(foods);
};

// @desc    Create a food item
// @route   POST /api/foods
// @access  Private/Admin
const createFood = async (req, res) => {
    const { name, category, price, image, description, foodType } = req.body;

    const food = new Food({
        name,
        category,
        price,
        image,
        description,
        foodType: foodType || 'Veg',
        restaurantId: req.user._id
    });

    const createdFood = await food.save();
    res.status(201).json(createdFood);
};

// @desc    Update a food item
// @route   PUT /api/foods/:id
// @access  Private/Admin
const updateFood = async (req, res) => {
    const { name, category, price, image, description, foodType } = req.body;

    const food = await Food.findById(req.params.id);

    if (food) {
        if (req.user.role !== 'admin' && food.restaurantId?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this food' });
        }

        food.name = name;
        food.category = category;
        food.price = price;
        food.image = image;
        food.description = description;
        food.foodType = foodType || food.foodType;

        const updatedFood = await food.save();
        res.json(updatedFood);
    } else {
        res.status(404).json({ message: 'Food not found' });
    }
};

// @desc    Delete a food item
// @route   DELETE /api/foods/:id
// @access  Private/Admin
const deleteFood = async (req, res) => {
    const food = await Food.findById(req.params.id);

    if (food) {
        if (req.user.role !== 'admin' && food.restaurantId?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this food' });
        }

        await food.deleteOne();
        res.json({ message: 'Food removed' });
    } else {
        res.status(404).json({ message: 'Food not found' });
    }
};

// @desc    Import food items from CSV/Excel
// @route   POST /api/foods/import
// @access  Private/Admin
const importFoods = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file' });
    }

    try {
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            return res.status(400).json({ message: 'The file is empty' });
        }

        // Basic validation and mapping
        const formattedFoods = data.map(item => ({
            name: item.name || item.Name,
            category: item.category || item.Category,
            price: Number(item.price || item.Price),
            image: item.image || item.Image || '',
            description: item.description || item.Description || '',
            foodType: item.foodType || item.FoodType || 'Veg',
            restaurantId: req.user._id
        }));

        // Filter out items without required fields
        const validFoods = formattedFoods.filter(food => food.name && food.category && !isNaN(food.price));

        if (validFoods.length === 0) {
            return res.status(400).json({
                message: 'No valid food items found. Ensure columns are: name, category, price, image, description'
            });
        }

        const createdFoods = await Food.insertMany(validFoods);
        res.status(201).json({
            message: `${createdFoods.length} foods imported successfully`,
            foods: createdFoods
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Import failed' });
    }
};

// @desc    Get foods for logged in restaurant
// @route   GET /api/foods/myfoods
// @access  Private/Restaurant
const getMyFoods = async (req, res) => {
    const foods = await Food.find({ restaurantId: req.user._id });
    res.json(foods);
};

// @desc    Toggle food availability
// @route   PUT /api/foods/:id/availability
// @access  Private/Restaurant
const toggleFoodAvailability = async (req, res) => {
    const food = await Food.findById(req.params.id);

    if (food) {
        if (req.user.role !== 'admin' && food.restaurantId?.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to modify this food' });
        }

        food.isAvailable = !food.isAvailable;
        await food.save();
        res.json({ message: 'Availability toggled', isAvailable: food.isAvailable });
    } else {
        res.status(404).json({ message: 'Food not found' });
    }
};

module.exports = { getFoods, createFood, updateFood, deleteFood, importFoods, getMyFoods, toggleFoodAvailability };
