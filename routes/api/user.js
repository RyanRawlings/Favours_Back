const express = require("express");
const router = express.Router();
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const verify = require("../verifyToken");
const UserModel = require("../../models/User.js");
const UserGroupModel = require("../../models/UserGroup.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../../validation");
const welcomeEmail = require("../api/email").welcomeEmail;
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

exports.userRegister = async (req, res) => {
  //Validate the data before passing the request to the DB
  console.log("Data request recieved...",req.body)
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Check if email already exists
  const emailExists = await UserModel.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email exists already!");

  //Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  //Create new user
  const userData = {
    firstname: req.body.firstname,
    middlename: req.body.middlename,
    lastname: req.body.lastname,
    email: req.body.email,
    password: hashedPassword,
    create_time: new Date(),
    update_time: new Date()
  };

  const user = new UserModel(userData);

  try {
    const savedUser = await user.save();
    res.send({ user: user._id });
    welcomeEmail(userData);
  } catch (err) {
    res.status(400).send(err);
  }
};

exports.userLogin = async (req, res) => {
  //Validate the data before passing the request to the DB
  console.log("Data request recieved...",req.body);
  
  const { error } = loginValidation(req.body);
  if (error) return res.send({message: error.details[0].message});

  //Check if email exists
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) return res.send({ message: "Email is not found"});

  //Password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.send({message: "Invalid password"});

  //Create and assign a token
  const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET);
  res.cookie("token", token, { httpOnly: true });
  res.json({
    token: token,
    user: {
      id: user._id,
      firstname: user.firstname,
      email: user.email
    }
  });

  // res.header('auth-token', token).send(token);

  console.log("User logged in and token assigned");
};

exports.getUserProfile = async (req, res) => {
  let result = await UserModel.find({ firstname: "Wei" }).populate({
    path: "group",
    model: "UserGroup"
  });

  responseJSON(res, result);
};

exports.getUsers = async (req, res) => {
  console.log("get users is being called");
  let result = await UserModel.find({});

  // let extractColumn = (arr, column) => arr.map(x => x[column]);

  // let userEmailArray = extractColumn(result, "email" );

  const userEmailArray = [];
  result.forEach(element => userEmailArray.push({
    _id: element._id,
    email: element.email,
  }));

  responseJSON(res, userEmailArray);
}
