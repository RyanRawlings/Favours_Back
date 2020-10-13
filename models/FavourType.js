const mongoose = require("mongoose");

const favourTypeSchema = new mongoose.Schema({    
    name: {
            type: String,
            required: true
        }
    })

module.exports = mongoose.model("FavourType", favourTypeSchema, "favourType");