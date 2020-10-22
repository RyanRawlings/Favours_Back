const express = require("express");
const router = express.Router();
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const verify = require("../verifyToken");
const UserModel = require("../../models/User.js");
const PublicRequestsModel = require("../../models/PublicRequest");
const UserGroupModel = require("../../models/UserGroup.js");
const mongoose = require("mongoose");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../../validation");
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

exports.getPublicRequests = async (req, res) => {
  console.log("1111");
  let result = await PublicRequestsModel.find({}).populate({
    path: "requestUser",
    model: "User",

    populate: {
      path: "groupId",
      model: "UserGroup"
    }
  });
  console.log("result", result);
  responseJSON(res, result);
};

exports.createPublicRequest = async (req, res) => {
  console.log("Create public request started...");
  // console.log(req.body);
  // console.log(req.body.rewards);

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
    // console.log(req.body.rewards[0].rewardId);
    // console.log(req.body.rewards[0].offeredById);

    rewardsArray.push({
      // item: mongoose.Types.ObjectId(req.body.rewards[i].rewardName),
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
    res.send({ publicRequestId: savedPublicRequest._id });
    console.log("Successfully added to MongoDB");
  } catch (err) {
    res.status(400).send(err);
    console.log(err);
  }
};

exports.deletePublicRequest = async (req, res) => {
  console.log("delete favour called");
  // User.findByOne({_id: req.user});
  const idToDelete = req.body._id;
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
};

exports.addReward = async (req, res) => {
  console.log("add reward called");
  console.log("reward query", req.body);
  const idToUpdate = req.body._id;
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

  console.log(data);
};

exports.claimPublicRequest = async (req, res) => {
  console.log("claimPublicRequest called");
  console.log("reward query", req.body);
  const idToClaim = req.body._id;
  mongoose.set("useFindAndModify", false);
  //delete request
  PublicRequestsModel.findByIdAndDelete(idToClaim, function(err) {
    if (err) {
      res.send({
        message: "There was an error deleting the public request " + err
      });
    } else {
      res.send({ message: "Successfully deleted public request" });
    }
  });
  // create favour
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
    console.log(savedFavour);
    res.send({ message: "Successfully created Favour", success: true });
  } catch (err) {
    res.status(400).send({ message: "Error creating Favour", success: false });
    // console.log(err);
  }

  //res.json({ message: "Successfully adding public request", data: data });

  //console.log(data);
};
