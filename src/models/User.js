const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    phone: String,
    registerDate: {
        type: Date,
        default: Date.now
    }
});

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

module.exports = mongoose.model('User', userSchema); 