const express = require("express");
const router = express.Router();
const MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");
const assert = require("assert");
const verify = require("../verifyToken");
const UserModel = require("../../models/User.js");
const Favour = require("../../models/Favour.js");
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

exports.getFavours = async (req, res) => {

    const userId = req.body.userId;
    const query = {
        $or: [
            { requestUser: userId },
            { owingUser: userId }
        ]
    }

    let result = await Favour.find().or(query);

    let creditArray = [];
    let debitArray = [];
    let bothArrays = [];
    
    if (result) {
        // console.log(userId,result[0].requestUser,mongoose.Types.ObjectId(result[0].requestUser).equals(mongoose.Types.ObjectId(userId)))
        for (let i = 0; i < result.length; i++) {
            if (mongoose.Types.ObjectId(result[i].requestUser).equals(mongoose.Types.ObjectId(userId))) {
                debitArray.push(result[i]);
            } else if (mongoose.Types.ObjectId(result[i].owingUser).equals(mongoose.Types.ObjectId(userId))) {
                creditArray.push(result[i]);
            }
        }
    
        bothArrays = [{ credits: creditArray }, { debits: debitArray }];
    }

    console.log("result", bothArrays);
    responseJSON(res, bothArrays);
};
