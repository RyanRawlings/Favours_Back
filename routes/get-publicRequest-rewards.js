const PublicRequest = require("../models/PublicRequest");
const User = require("../models/User");
const router = require("express").Router();
const mongoose = require("mongoose");
const MongoClient = require("mongodb").MongoClient;

//Connection URL
const url = process.env.DB_CONNECTION;

//Database Name
const dbName = 'Favours';

router.post("/get-publicRequest-rewards", async (req, res) => {
    console.log("get public request rewards...");
    // console.log(req.body);
    // console.log(req.body.rewards);
    
    // Get the document relating to the requesting user
    const publicRequest = await PublicRequest.findOne({ _id: req.body._id });

    const { rewards } = publicRequest;

    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("Favours");
        dbo.collection("publicRequests").findOne({ _id: req.body._id }).aggregate([
          { $lookup:
             {
               from: 'favourType',
               localField: 'item',
               foreignField: '_id',
               as: 'rewardName'
             }
           }
          ]).toArray(function(err, res) {
          if (err) throw err;
          console.log(JSON.stringify(res));
          db.close();
        });
      });

    // res.send(rewards);
    

    // // Store UserId in separate variable from retrieved document
    // const requestUser = user._id;

    // // Create Public Request
    // const publicRequest = new PublicRequest({
    //   requestUser: requestUser,
    //   title: req.body.requestTitle,
    //   description: req.body.requestTaskDescription,
    //   rewards: [],
    //   completed: false,
    // });
    
    // let rewardsArray = [];
    // for (let i = 0; i < req.body.rewards.length; i++) {
    //   console.log("Post creation child push start...");
    //   // console.log(req.body.rewards[0].rewardId);
    //   // console.log(req.body.rewards[0].offeredById);
      
    //   rewardsArray.push({
    //         item: mongoose.Types.ObjectId(req.body.rewards[i].rewardId),
    //         quantity: req.body.rewards[i].rewardQuantity,
    //         providedBy: mongoose.Types.ObjectId(req.body.rewards[i].offeredById)
    //   })

    //   publicRequest.rewards.push(rewardsArray[i]);
    // }  

    // try {
    //   const savedPublicRequest = await publicRequest.save();
    //   res.send({ publicRequestId: savedPublicRequest._id });
    //   console.log("Successfully added to MongoDB");
    // } catch (err) {
    //   res.status(400).send(err);
    //   console.log(err);
    // }

  });

module.exports = router;