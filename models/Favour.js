const mongoose = require('mongoose');

const favourSchema = new mongoose.Schema({ 
    FavourRequestingUserId: {
        type: String,
        required: true,
        min: 1
    },
    FavourOwingUserId: {
        type: String,
        required: true,
        min: 1
    },
    FavourTitle: {
        type: String,
        required: true,
        min: 1
    },
    FavourDescription: {
        type: String,
        required: true,
        max: 1024,
        min: 1
    },
    FavourImageKey: {
        type: String,
        required: true,
        max: 1024,
        min: 8
    },
    FavourDateStamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Favour', favourSchema);