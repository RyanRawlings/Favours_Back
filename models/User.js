const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    min: 1
  },
  // middlename: {
  //   type: String,
  //   required: false,
  //   min: 1
  // },
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
  group: { type: mongoose.Schema.Types.ObjectId, ref: "userGroups" },
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

module.exports = mongoose.model("User", userSchema, "users");
