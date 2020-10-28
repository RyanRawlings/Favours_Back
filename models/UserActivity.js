const mongoose = require("mongoose");

/**
 * database model for UserActivity table
 * columns are userId, time
 */
const userActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
    },
    action: {
        type: String,
        required: true
    },
    time: {type: Date, default: Date.now}
});

// exporting UserActivity table
module.exports = mongoose.model("UserActivity", userActivitySchema, "userActivity");
