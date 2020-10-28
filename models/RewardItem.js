const mongoose = require("mongoose");

/**
 * database model for Rewards table
 * column is name
 */
const rewardsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

// exporting Rewards table
module.exports = mongoose.model("Rewards", rewardsSchema);
