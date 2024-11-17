const bcrypt = require('bcrypt');
const User = require('../models/User');

const initializeAdmin = async () => {
    try {
        const existingAdmin = await User.findOne({ username: process.env.ADMIN_USERNAME });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
            const adminUser = new User({
                username: process.env.ADMIN_USERNAME,
                password: hashedPassword,
                email: process.env.ADMIN_EMAIL,
                firstName: process.env.ADMIN_FIRSTNAME || 'Admin',
                lastName: process.env.ADMIN_LASTNAME || 'User',
                age: 30,
                gender: 'other',
                role: 'admin',
            });
            await adminUser.save();
            console.log('Admin account created successfully');
        } else {
            console.log('Admin account already exists');
        }
    } catch (error) {
        console.error('Error initializing admin account:', error);
    }
};

module.exports = initializeAdmin;
