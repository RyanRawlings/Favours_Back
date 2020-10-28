const mongoose = require('mongoose');

/**
 * database model for Gets table
 * columns are favourId, favourRequestingUserId, favourOwingUserId, favourDescription, favourImageKey, favourDateStamp
 */
const GetSchema = mongoose.Schema({
    favourId: String,
    favourRequestingUserId: String,
    favourOwingUserId: String,
    favourDescription: String,
    favourImageKey: String,
    favourDateStamp: Date

})

// exporting Gets table
module.exports = mongoose.model('Gets', GetSchema);