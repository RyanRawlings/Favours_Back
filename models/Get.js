const mongoose = require('mongoose');

const GetSchema = mongoose.Schema({
    favourId: String,
    favourRequestingUserId: String,
    favourOwingUserId: String,
    favourDescription: String,
    favourImageKey: String,
    favourDateStamp: Date

})

module.exports = mongoose.model('Gets', GetSchema);