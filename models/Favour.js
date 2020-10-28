const mongoose = require("mongoose");
var ObjectID = require("mongodb").ObjectID;

/**
 * database model for Favour table
 * columns are create_time, requestUser, owingUser, description, favourOwed, is_completed, debt_forgiven, is_uploaded, uploadImageUrl, snippet
 */
const favourSchema = new mongoose.Schema({
    create_time: {type: Date, default: Date.now},
    requestUser: {type: ObjectID, required: true},
    owingUser: {type: ObjectID},
    description: {type: String, required: true},
    favourOwed: String,
    is_completed: Boolean,
    debt_forgiven: Boolean,
    proofs: {
        is_uploaded: Boolean,
        uploadImageUrl: {type: String, required: false},
        snippet: String
    }
});

// exporting Favour table
module.exports = mongoose.model("Favour", favourSchema);
