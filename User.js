const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    twoFASecret: { type: String },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
});

module.exports = mongoose.model('User', userSchema);
