const mongoose = require("mongoose");

const rewardsSchema = new mongoose.Schema({
    group_name: {
      type: String,
      required: true,
      min: 1
    }
  });

  module.exports = mongoose.model("Rewards", rewardsSchema);
