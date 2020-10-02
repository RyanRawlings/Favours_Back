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
        min: 1
    },
    middlename: {
        type: String,
        required: false,
        min: 1
    },
    lastname: {
        type: String,
        required: true,
        min: 1
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
        min: 8
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);