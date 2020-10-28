const mongoose = require("mongoose");

/**
 * database model for FavourType table
 * column is name
 */
const favourTypeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

// exporting FavourType table
module.exports = mongoose.model("FavourType", favourTypeSchema, "favourType");