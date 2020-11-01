const express = require("express");
const mongoose = require("mongoose");
const FavourModel = require("../../models/Favour.js");
const FavourTypeModel = require("../../models/FavourType");
const PublicRequestsModel = require("../../models/PublicRequest");
require("dotenv/config");

//Connection URL
const url = process.env.DB_CONNECTION;

//Database Name
const dbName = "Favours";

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

/*******************************************************
 * Creating favour
 * @desc add favour into favours table
 * @param email requestedBy, email owingUser, email owingUser, string requestTaskDescription
 * @return boolean true, string message
 *******************************************************/

exports.createFavour = async (req, res) => {
 
  // Create Public Request
  const favour = await FavourModel.create({
    requestUser: req.body.requestUser,
    owingUser: req.body.owingUser,
    description: req.body.description,
    favourOwed: req.body.favourOwed,
    is_completed: false,
    debt_forgiven: false,
    proofs: {
      is_uploaded: false,
      uploadImageUrl: null,
      snippet: ""
    }
  });

  try {
        const savedFavour = await favour.save();
        res.send({
          message: "Successfully created Favour",
          success: true,
          _id: savedFavour._id,
          favourOwed: savedFavour.favourOwed
        });
      } catch (err) {
        
        res.status(400).send({ message: "Error creating Favour", success: false });
        
      }
    };

    /*******************************************************
     * Get all favour 
     * @desc returns all favours from favour table
     * @param void
     * @return array object favour
     *******************************************************/


    exports.getFavours = async (req, res) => {
      
      const userId = req.body.userId;
      const query = {
        $or: [{ requestUser: userId }, { owingUser: userId }]
      };
      try {
          let result = await FavourModel.find().or(query);

          let creditArray = [];
          let debitArray = [];
          let forgivenArray = [];
          let bothArrays = [];

          if (result) {
            for (let i = 0; i < result.length; i++) {
              if (result[i].debt_forgiven === true) {
                forgivenArray.push(result[i]);
              } else {
                if (
                  mongoose.Types.ObjectId(result[i].owingUser).equals(
                    mongoose.Types.ObjectId(userId)
                  )
                ) {
                  debitArray.push(result[i]);
                } else if (
                  mongoose.Types.ObjectId(result[i].requestUser).equals(
                    mongoose.Types.ObjectId(userId)
                  )
                ) {
                  creditArray.push(result[i]);
                }
              }
            }

            bothArrays = [
              { credits: creditArray },
              { debits: debitArray },
              { forgivenFavours: forgivenArray }
            ];
          }

          responseJSON(res, bothArrays);
      } catch (err) {
        res.send({ message: "There was an error retrieving the Favour" })
}};


/*******************************************************
 * Store image as a proof in Repay, Record, Claim public request
 * @desc takes id and update favours table
 * @param int _id
 * @return bool - if true
 *******************************************************/


exports.storeImageData = async (req, res) => {
  
  try {
    let type = req.body[req.body.length - 1].type;
    
    if (type === "Repay") {
      for (let i = 0; i < req.body.length - 1; i++) {
        let filter = { _id: mongoose.Types.ObjectId(req.body[i]._id) };
        let update = {
          $set: {
            is_completed: true,
            proofs: {
              is_uploaded: true,
              uploadImageUrl: req.body[i].imageUrl,
              snippet: ""
            }
          }
        };

        let doc = await FavourModel.findOneAndUpdate(filter, update, {
          new: true
        });
       
      }
    } else if (type === "Record") {
      for (let i = 0; i < req.body.length - 1; i++) {
        let filter = { _id: mongoose.Types.ObjectId(req.body[i]._id) };
        let update = {
          $set: {
            is_completed: false,
            proofs: {
              is_uploaded: true,
              uploadImageUrl: req.body[i].imageUrl,
              snippet: ""
            }
          }
        };

        let doc = await FavourModel.findOneAndUpdate(filter, update, {
          new: true
        });
      }
    } else if (type === "ClaimPublicRequest") {
      let uploadedBy = req.body[req.body.length - 1].uploadedBy;
      let snippet = req.body[req.body.length - 1].snippet;
      for (let i = 0; i < req.body.length - 1; i++) {
        let filter = { _id: mongoose.Types.ObjectId(req.body[i]._id) };
        let update = {
          $set: {
            completed: true,
            proof: {
              is_uploaded: true,
              uploadImageUrl: req.body[i].imageUrl,
              snippet: snippet,
              uploadedBy: uploadedBy
            }
          }
        };

        let doc = await PublicRequestsModel.findOneAndUpdate(filter, update, {
          new: true
        });
      }
    }

    res.send(doc);
  } catch (error) {
    res.send({
      message: "There was an error processing the image updates" + error
    });
  }
};


/*******************************************************
 * Forgive Debt
 * @desc takes id and update favours table
 * @param int _id
 * @return response , string message
 *******************************************************/

exports.forgiveDebt = async (req, res) => {
  try {
    let filter = { _id: mongoose.Types.ObjectId(req.body._id) };
    let update = { $set: { debt_forgiven: true, is_completed: true } };
    const response = await FavourModel.findOneAndUpdate(filter, update);

    responseJSON(res, response);
  } catch (error) {
    responseJSON(res, { message: error });
  }
};


/*******************************************************
 * Deleting favour
 * @desc takes id and delete from favours table
 * @param int _id
 * @return boolean ok, string message
 *******************************************************/
exports.deleteFavour = async (req, res) => {
      let deleteId = req.body._id;

      try {
        const response = await FavourModel.findOneAndDelete({_id: deleteId});
        
        if (response) {
          res.send({ok: true, message: "Successfully deleted Favour"})
        } else {
          res.send({ok: false, message: "Error deleting Favour"});
        }    

      } catch (err) {
        res.send({ok: false, message: err});
      }
}

/*******************************************************
 * Get favour type
 * @desc get all favourtype from favourType table
 * @param void
 * @return array object favourType
 *******************************************************/

exports.getFavourType = async (req, res) => {
  try {
    const response = await FavourTypeModel.find({});

    if (response) {
      res.send({ favourTypes: response });
    } else {
      res.send({ message: "There was an error retrieving the Favour types" });
    }
    
  } catch (err) {
    res.send({ message: "There was an error retrieving the Favour types" })
  }
}