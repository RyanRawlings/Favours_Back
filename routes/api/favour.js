const express = require("express");
const router = express.Router();
const MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const assert = require("assert");
const verify = require("../verifyToken");
const UserModel = require("../../models/User.js");
const FavourModel = require("../../models/Favour.js");
const UserGroupModel = require("../../models/UserGroup.js");
const PublicRequestsModel = require("../../models/PublicRequest");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../../validation");
const { response } = require("express");
// const User = require('../models/User');
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

exports.createFavour = async (req, res) => {
  console.log("Create favour started...");
  // console.log(req.body);
  // console.log(req.body.rewards);

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
    // console.log(savedFavour);
    res.send({
      message: "Successfully created Favour",
      success: true,
      _id: savedFavour._id
    });
  } catch (err) {
    res.status(400).send({ message: "Error creating Favour", success: false });
    // console.log(err);
  }
};

exports.getFavours = async (req, res) => {
  console.log(req.body);

  const userId = req.body.userId;
  const query = {
    $or: [{ requestUser: userId }, { owingUser: userId }]
  };

  let result = await FavourModel.find().or(query);

  let creditArray = [];
  let debitArray = [];
  let forgivenArray = [];
  let bothArrays = [];

  if (result) {
    // console.log(userId,result[0].requestUser,mongoose.Types.ObjectId(result[0].requestUser).equals(mongoose.Types.ObjectId(userId)))
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

  console.log("result", bothArrays);
  responseJSON(res, bothArrays);
};

exports.storeImageData = async (req, res) => {
  console.log(req.body);
  try {
    let type = req.body[req.body.length - 1].type;
    console.log(type);

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
        console.log(doc);
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
        console.log(doc);
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
        console.log(doc);
      }
    }

    let doc = await FavourModel.findOneAndUpdate(filter, update, {
      new: true
    });
    console.log(doc);

    responseJSON(res, "Processing complete.");
  } catch (error) {
    res.send({
      message: "There was an error processing the image updates" + error
    });
  }
};

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
