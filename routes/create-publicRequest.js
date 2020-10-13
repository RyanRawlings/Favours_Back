const PublicRequest = require("../models/PublicRequest");
const User = require("../models/User");
const router = require('express').Router();

router.post("/create-publicRequest", async (req, res) => {

    console.log("Create public request started...");

    // console.log(req.body);
    const user = await User.findOne({ email: req.body.requestedBy });
    // const favourType = await FavourType.findOne({ name: req.body.rewards.re });
    const requestUser = user._id;

    //Create Public Request
    const publicRequest = new PublicRequest({
      requestUser: requestUser,
      title: req.body.requestTitle,
      description: req.body.requestTaskDescription,
      rewards: [{
                    item: req.body.rewards.rewardId,
                    quantity: req.body.rewards.rewardQuantity,
                    providedBy: req.body.rewards.offeredById
      }],
    completed: false,
    });
    try {
      const savedPublicRequest = await publicRequest.save();
      res.send({ publicRequestId: savedPublicRequest._id });
      console.log("Successfully added to MongoDB");
    } catch (err) {
      res.status(400).send(err);
      console.log(err);
    }
  });

module.exports = router;