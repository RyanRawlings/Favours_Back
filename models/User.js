const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
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
  profileImageKey: { type: String, required: false },

  email: {
    type: String,
    required: true,
    max: 1024,
    min: 6
  },
  group: mongoose.Schema.Types.ObjectId,
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
});

const userGroupSchema = new mongoose.Schema({
  group_name: {
    type: String,
    required: true,
    min: 1
  },
  create_time: {
    type: Date,
    default: Date.now
  },
  image_url: {},
  department: {
    type: String,
    required: false,
    enum: ["IT", "Accounting", "Marketing"],
    default: "IT"
  },
  location: {
    country: { type: String },
    state: { type: String },
    suburb: { type: String },
    postcode: { type: Number }
  }
});

module.exports = mongoose.model("User", userSchema);
module.exports = mongoose.model("UserGroup", userGroupSchema);
