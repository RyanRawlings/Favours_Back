const mongoose = require("mongoose");

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

  module.exports = mongoose.model("UserGroup", userGroupSchema);
