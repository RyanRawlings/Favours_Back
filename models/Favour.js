const mongoose = require("mongoose");
var ObjectID = require('mongodb').ObjectID;

const favourSchema = new mongoose.Schema({
  create_time: { type: Date, default: Date.now },
  requestUser: { type: ObjectID, required: true, min: 1 },
  owingUser: { type: ObjectID},
  description: { type: String, required: true, max: 1024, min: 1 },
  owe_items: [{ item: ObjectID, quantity: { type: Number, required: true } }],
  is_completed: Boolean,
  proofs: {
    is_uploaded: Boolean,
    uploadImageUrl: { type: String, required: true },
    snippet: String
  }
});

// const PublicRequestShema = mongoose.Schema({
//   requestUser: { type: ObjectID, requied: true },
//   OwingUser: { type: ObjectID, requied: true },
//   create_time: { type: Date, default: Date.now },
//   title: { type: String, requied: true },
//   description: { type: String, requied: true },
//   rewards: [
//     {
//       item: { type: ObjectID, requied: true },
//       quantity: { type: Number, requied: true, min: 1 },
//       providedBy: ObjectID,
//       create_time: { type: Date, default: Date.now }
//     }
//   ],
//   is_completed: Boolean,
//   proofs: {
//     is_uploaded: Boolean,
//     uploadImageUrl: { type: String, required: true },
//     snippet: { type: String, requied: false },
//     uploadedBy: ObjectID
//   }
// });

// const RewardItemSchema = mongoose.Schema({
//   name: { type: String, required: true },
//   imageUrl: { type: String, required: true }
// });

module.exports = mongoose.model("Favour", favourSchema);
// module.exports = mongoose.model("publicRequest", PublicRequestShema);
// module.exports = mongoose.model("rewardItem", RewardItemSchema);
