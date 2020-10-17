const mongoose = require("mongoose");

const rewardsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("Rewards", rewardsSchema);
