const UserModel = require("../../models/User.js");
const PublicRequestsModel = require("../../models/PublicRequest");
const FavourModel = require("../../models/Favour.js");
const mongoose = require("mongoose");

require("dotenv/config");

//Respond format
const responseJSON = function(res, ret) {
  if (typeof ret === "undefined") {
    res.json({
      code: "-200",
      msg: "The operation failure"
    });
  } else {
    res.json(ret);
  }
};

/*******************************************************************
 * Get all public requests
 * @desc returns all public requests from publicRequests table
 * @param void
 * @return array object allPublicRequests
 *******************************************************************/
exports.getPublicRequests = async (req, res) => {
  
  let result = await PublicRequestsModel.find({}).populate({
    path: "requestUser",
    model: "User",

    populate: {
      path: "groupId",
      model: "UserGroup"
    }
  });
  responseJSON(res, result);
};

/**********************************************************************************************
 * Create public request
 * @desc saves public request on database
 * @param email requestedBy, string requestTitle, string requestTaskDescription, array rewards
 * @return int publicRequestId - public request id saved in database
 **********************************************************************************************/

exports.createPublicRequest = async (req, res) => {
  
  // Get the document relating to the requesting user
  const user = await UserModel.findOne({ email: req.body.requestedBy });

  // Store UserId in separate variable from retrieved document
  const requestUser = user._id;

  // Create Public Request
  const publicRequest = await PublicRequestsModel.create({
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

    rewardsArray.push({
      
      item: req.body.rewards[i].rewardName,
      quantity: req.body.rewards[i].rewardQuantity,
      providedBy: mongoose.Types.ObjectId(req.body.rewards[i].offeredById),
      onModel: "FavourType"
    });

    console.log(
      "this is new reward is offered by: ",
      mongoose.Types.ObjectId(req.body.rewards[i].offeredById)
    );
    publicRequest.rewards.push(rewardsArray[i]);
  }

  try {
    const savedPublicRequest = await publicRequest.save();
    res.send({
      publicRequestId: savedPublicRequest._id,
      newPublicRequest: savedPublicRequest
    });

    console.log("Successfully added to MongoDB");
    
  } catch (err) {
    res.status(400).send(err);
  }
};


/*******************************************************
 * Deleting public request
 * @desc takes id and delete from favours table
 * @param int _id
 * @return string message
 *******************************************************/

exports.deletePublicRequest = async (req, res) => {
  
  const idToDelete = req.body._id;
  try{
      mongoose.set("useFindAndModify", false);

      PublicRequestsModel.findByIdAndDelete(idToDelete, function(err) {
        if (err) {
          res.send({
            message: "There was an error deleting the public request " + err
          });
        } else {
          res.send({ message: "Successfully deleted public request" });
        }
      });
  }catch (err) {
    res.status(400).send(err);
  }

};

/*************************************************************************************************
 * Add reward
 * @dec Add reward into exsiting reward array
 * @param {array} req contains favourid, newReward(array) and privided by newUserDetails(object)
 * @param {array} res response
 * @return {array} response -> contains the msg from backend "success" or "error"
 *
 *************************************************************************************************/

exports.addReward = async (req, res) => {
  
  const idToUpdate = req.body._id;
  try{
      mongoose.set("useFindAndModify", false);
      let data = await PublicRequestsModel.findByIdAndUpdate(
        idToUpdate,
        {
          $set: { rewards: req.body.newReward }
        },
        function(err) {
          if (err) {
            res.send({
              message: "There was an error adding the public request " + err
            });
          }
        }
      );

      res.json({ message: "Successfully adding public request", data: data });
  }catch (err) {
  res.status(400).send(err);
}

};

/*************************************************************************************************
 * Claim public request
 * @dec Transfer the public request into favours
 * @param {array} req contains newFavour(object)
 * @param {array} res response
 * @return {array} response -> contains the msg from backend "success" or "error"
 *
 *************************************************************************************************/

exports.claimPublicRequest = async (req, res) => {
  
  const newFavour = [];
  req.body.map(item => {
    newFavour.push({
      requestUser: item.owingUser,
      owingUser: item.requestUser,
      description: item.description,
      favourOwed: item.favourOwed,
      is_completed: false,
      debt_forgiven: false,
      proofs: {
        is_uploaded: false,
        uploadImageUrl: null,
        snippet: ""
      }
    });
  });

  // create favour
  try{
    const favour = await FavourModel.create(newFavour);

    await db.collection("favours").insert(favour);
  }catch (err) {
    res.status(400).send(err);
  }

};
