const bcrypt = require('bcryptjs');

const users = [
    {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123', // Will be hashed by pre-save hook? No, insertMany triggers hooks? No, insertMany bypasses hooks. I need to hash manually here or use create in loop.
        role: 'admin'
    },
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'user'
    }
];

// Ideally hash passwords here manually if using insertMany
// Or allow plain text and let model handle it, but insertMany bypasses middleware.
// For simplicity, let's just use plain text and note that login uses compare(plain, hashed).
// Oh wait, login uses compare(entered, stored_hash). So I MUST hash it here.
// But bcrypt is async. I can't do it easily in static array export.
// I will modify seeder.js to loop and create users so hooks run.
// Or just export unhashed and loop in seeder.

module.exports = users;
