const PublicRequest = require("../models/PublicRequest");
const User = require("../models/User");
const router = require("express").Router();
const mongoose = require("mongoose");

router.post("/create-publicRequest", async (req, res) => {
    console.log("Create public request started...");
    // console.log(req.body);
    // console.log(req.body.rewards);

    // Get the document relating to the requesting user
    const user = await User.findOne({ email: req.body.requestedBy });
    
    // Store UserId in separate variable from retrieved document
    const requestUser = user._id;

    // Create Public Request
    const publicRequest = await PublicRequest.create({
      requestUser: requestUser,
      title: req.body.requestTitle,
      description: req.body.requestTaskDescription,
      rewards: [],
      completed: false,
      proof: {
        uploaded: false,
        uploadImageKey: "",
        snippet: "",
        uploadedBy: null
    }
    });
    
    let rewardsArray = [];
    for (let i = 0; i < req.body.rewards.length; i++) {
      console.log("Post creation child push start...");
      // console.log(req.body.rewards[0].rewardId);
      // console.log(req.body.rewards[0].offeredById);
      
      rewardsArray.push({
            // item: mongoose.Types.ObjectId(req.body.rewards[i].rewardName),
            item: req.body.rewards[i].rewardName,
            quantity: req.body.rewards[i].rewardQuantity,
            providedBy: mongoose.Types.ObjectId(req.body.rewards[i].offeredById),
            onModel: "FavourType"
      })

      publicRequest.rewards.push(rewardsArray[i]);
    }  

    try {
      const savedPublicRequest = await publicRequest.save();
      res.send({ publicRequestId: savedPublicRequest._id, publicRequest: publicRequest });
      console.log("Successfully added to MongoDB");
    } catch (err) {
      res.status(400).send(err);
      console.log(err);
    }
  });

module.exports = router;