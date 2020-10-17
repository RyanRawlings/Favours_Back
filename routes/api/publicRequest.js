const express = require("express");
const router = express.Router();
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const verify = require("../verifyToken");
const UserModel = require("../../models/User.js");
const PublicRequestsModel = require("../../models/PublicRequest");
const UserGroupModel = require("../../models/UserGroup.js");

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
