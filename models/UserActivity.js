const mongoose = require("mongoose");

const userActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        required: true
        },
    action: {
    type: String,
    required: true
  },
  time: { type: Date, default: Date.now}
});

module.exports = mongoose.model("UserActivity", userActivitySchema, "userActivity");
