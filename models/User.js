const mongoose = require("mongoose");
require("./UserGroup");

/**
 * database model for User table
 * columns are firstname, lastname, profileImageUrl, email, groups, password, create_time, last_update
 */
const userSchema = new mongoose.Schema({
<<<<<<< Updated upstream
  firstname: {
    type: String,
    required: true,
    min: 1
  },
  lastname: {
    type: String,
    required: true,
    min: 1
  },
  profileImageUrl: { type: String, required: false },
  email: {
    type: String,
    required: true,
    max: 1024,
    min: 6
  },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "UserGroup" }],
  password: {
    type: String,
    required: true,
    max: 1024,
    min: 8
  },
  create_time: {
    type: Date,
    default: Date.now
  },
  last_update: {
    type: Date,
    default: Date.now
  }
=======
    firstname: {
        type: String,
        required: true,
        min: 1
    },
    lastname: {
        type: String,
        required: true,
        min: 1
    },
    profileImageUrl: {type: String, required: false},

    email: {
        type: String,
        required: true,
        max: 1024,
        min: 6
    },
    groups: [{type: mongoose.Schema.Types.ObjectId, ref: "UserGroup"}],
    password: {
        type: String,
        required: true,
        max: 1024,
        min: 8
    },
    create_time: {
        type: Date,
        default: Date.now
    },
    last_update: {
        type: Date,
        default: Date.now
    }
>>>>>>> Stashed changes
});

// exporting User table
module.exports = mongoose.model("User", userSchema, "users");

