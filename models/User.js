const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 6
    },    
    firstname: {
        type: String,
        required: true,
        min: 8
    },
    middlename: {
        type: String,
        required: false,
        min: 8
    },
    lastname: {
        type: String,
        required: true,
        min: 8
    },
    email: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);