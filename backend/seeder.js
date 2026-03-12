const mongoose = require('mongoose');
const dotenv = require('dotenv');
const users = require('./data/users');
const foods = require('./data/foods');
const User = require('./models/User');
const Food = require('./models/Food');
const Order = require('./models/Order');


dotenv.config();

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });

const importData = async () => {
    try {
        await Order.deleteMany();
        await Food.deleteMany();
        await User.deleteMany();

        const createdUsers = [];
        for (const user of users) {
            const newUser = await User.create(user);
            createdUsers.push(newUser);
        }

        const adminUser = createdUsers[0]._id;

        const sampleFoods = foods.map((food) => {
            return { ...food, user: adminUser };
        });

        await Food.insertMany(sampleFoods);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

const destroyData = async () => {
    try {
        await Order.deleteMany();
        await Food.deleteMany();
        await User.deleteMany();

        console.log('Data Destroyed!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

if (process.argv[2] === '-d') {
    destroyData();
} else {
    importData();
}
