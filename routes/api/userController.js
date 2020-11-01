const fs = require('fs');
const express = require("express");
const app = express();
const router = express.Router();
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const verify = require("../verifyToken");
const UserModel = require("../../models/User.js");
const UserGroupModel = require("../../models/UserGroup.js");
const UserActivityModel = require("../../models/UserActivity.js");
const FavourModel = require("../../models/Favour.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../../validation");
const sortObjectsArray = require('sort-objects-array');
const mongoose = require("mongoose");
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
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

/*******************************************************************************************
 * Returns user id on success or 400 status on error
 * 
 * @param {array} req contains firstname, lastname, email, password of the new user
 * @param {array} res response 
 * @return {array} response -> user id or status 400 error
 *
 *******************************************************************************************/

exports.userRegister = async (req, res) => {  
  // console.log("register called inside controller...")

  // Validate the data before passing the request to the DB
  console.log("Data request recieved...",req.body)
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // Check if email already exists
  const emailExists = await UserModel.findOne({ email: req.body.email });
  if (emailExists) return res.status(400).send("Email exists already!");

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create new user data
  const userData = {
    firstname: req.body.firstname,
    middlename: req.body.middlename,
    lastname: req.body.lastname,
    email: req.body.email,
    profileImageUrl: "",
    groups: [mongoose.Types.ObjectId('5f83f0665f368aca8798e1ec')],
    password: hashedPassword,
    create_time: new Date(),
    update_time: new Date()
  };

  const user = new UserModel(userData);
  
  try {
    const savedUser = await user.save();
    // const savedUpdatedUser = await updateUser.save();
    res.send({ savedUser: savedUser });
  } catch (err) {
    res.status(400).send(err);
  }
};

/*************************************************************************************************
 * Returns jwt token and user details to be updated in UserContext and stored in Cookies client side
 * 
 * @param {array} req contains email and password string of user trying to log in
 * @param {array} res response 
 * @return {array} response -> contains array containing user details and jwt token. 
 * 
 *************************************************************************************************/

exports.userLogin = async (req, res) => {
  // console.log("login called inside controller...")
  
  // Validate the data before passing the request to the DB
  console.log("Data request recieved...",req.body);

  const { error } = loginValidation(req.body);
  if (error) return res.send({message: error.details[0].message});

  // Check if email exists
  const user = await UserModel.findOne({ email: req.body.email });
  if (!user) return res.send({ message: "Email is not found"});

  // Check password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.send({message: "Invalid password"});

   //Create and assign a token
   const token = jwt.sign({
                              _id: user._id,
                              firstname: user.firstname,
                              lastname: user.lastname,
                              email: user.email
                          }, 
                          process.env.TOKEN_SECRET
                        );
  //  res.cookie('auth-token', token, { httpOnly: true });
   res.json({token: token
             ,user: {
                       id: user._id,
                       firstname: user.firstname,
                       lastname: user.lastname,
                       email: user.email,
                    }
           });

  console.log("User logged in and token assigned");
};

exports.userLogout = async (req, res) => {
  res.clearCookie();
};

/****************************************************************************************************
 * Returns a success status message indicating whether the database update completed successfully
 * 
 * @param {array} req contains the userId and aws imageUrl
 * @param {array} res response 
 * @return {array} response message -> success status
 * 
 ****************************************************************************************************/
exports.updateUserProfileImage = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.body._id);
  const profileImageUrl = req.body.imageUrl;

  const filter = { _id: userId };
  const update = { profileImageUrl: profileImageUrl }

  const user = await UserModel.findOneAndUpdate(filter, update);

  if (user) {
    console.log(user);
    return responseJSON(res, { message: "Successfully uploaded image" });
  } else {
    return responseJSON(res, { message: "Error in uploading image" });
  }
  
};

/***************************************************************************************************************
 * Returns an array of all users
 * 
 * @param {array} req unused
 * @param {array} res response 
 * @return {array} userEmailArray -> returns an array of object arrays that contain the userId and userEmail
 * 
 ***************************************************************************************************************/
exports.getAllUsers = async (req, res) => {
  console.log("get users is being called");
  let result = await UserModel.find({});

  const userEmailArray = [];
  result.forEach(element => userEmailArray.push({
    _id: element._id,
    email: element.email,
  }));

  responseJSON(res, userEmailArray);
}

/*****************************************************************************
 * Api for user's emails
 * Currently being used to fetch the specific emails for each of the users,
 * that have added rewards to a Public Request
 * 
 * @desc takes user's ids and returns user's email from database
 * @param array list
 * @return array userArray
 *****************************************************************************/
exports.getUserEmails = async (req, res) => {

    const userIdList = [];
    const tempUserIdList = req.body;

    // Cast id strings as mongo ObjectId type
    for (let i = 0; i < tempUserIdList.length; i++) {
        userIdList.push(mongoose.Types.ObjectId(req.body[i]));
    }

    // console.log("UserId List: ", userIdList);

    const response = await UserModel.find({_id: {$in: userIdList}});

    if (response) {
      let userArray = [];

      for (let i = 0; i < response.length; i++) {
          userArray.push({
              _id: response[i]._id,
              firstname: response[i].firstname,
              email: response[i].email,
          });
      }
      
      res.send(userArray);
    } else {
      res.send({message: "There was an error retrieving the emails for the relevant users"});
    }    
}

/*******************************************************************************************************************
 * Returns an array of object arrays pertaining to each of the groups the active user is a part of
 * 
 * @param {array} req contains the id of the active user
 * @param {array} res response 
 * @return {array} resultDocument.groups -> returns the nested group documents that have been populated with the relevant group data
 * 
 *******************************************************************************************************************/
exports.getUserGroups = async (req, res) => {
  console.log("get user groups is being called");

  const userId = req.body.userId;

  const filter = { _id: mongoose.Types.ObjectId(userId) };

  const result = await UserModel.findOne(filter);

  await result.populate('groups')
              .execPopulate()
              .then(resultDocument => {
                console.log(resultDocument.groups);
                responseJSON(res, resultDocument.groups);
              })
              .catch(error => {
                console.log(error);
                res.send("Error occurred");
              });
}

/***************************************************************************************************
 * Returns an array of arrays containing all the users for each groupId in the request 
 * 
 * @param {array} req contains an array of groupIds in the body
 * @param {array} res response 
 * @return {array} groupArrays -> information about the user account
 * 
 ***************************************************************************************************/
exports.getGroupUsers = async (req, res) => {
    let extractColumn = (arr, column) => arr.map(x => x[column]);

    const groups = req.body.groups;

    let groupArrays = [];

    groups.forEach(element => groupArrays.push({
        _id: element._id,
        group_name: element.group_name
    }))

    for (let i = 0; i < groupArrays.length; i++) {
      const result = await UserModel.find({
                                            groups: {
                                                     $in: groupArrays[i]._id
                                      }});
      if (result) {
        const userEmails = extractColumn(result, 'email');

        groupArrays[i]['users'] = userEmails;

      }                                      
    }

    if (groupArrays) {
      console.log(groupArrays)
      responseJSON(res, groupArrays);
    }
}

/***************************************************************************************
 * Returns an object array about the active user account
 * 
 * @param {array} req contains the userId of the active user
 * @param {array} res response 
 * @return {array} result -> information about the user account
 * 
 **************************************************************************************/
exports.getUser = async (req, res) => {
  let result = await UserModel.findOne(req.body);
  
  if (result) {
    res.send(result);
  }
}

/******************************************************************************************************************
 * Returns an array of user emails that the user should join a party with
 * 
 * @param {array} req unused parameter
 * @param {array} res response
 * @return {array} leaderboard -> leaderboard data in the form of object array is sent back to requester
 * 
 ******************************************************************************************************************/
exports.userLeaderboard = async (req, res) => {
  try {
    let users = await UserModel.aggregate([
      { $project: { email: 1, firstname: 1, lastname: 1 } }
    ]);
  
    let leaderboardArray = [];
    for (let i = 0; i < users.length; i++) {
      let requestUser = users[i]._id;
      let owingUser = users[i]._id;
  
      let favourCredits = await FavourModel.countDocuments({ 
        requestUser: requestUser
      });
  
      let favourDebits = await FavourModel.countDocuments({ 
        owingUser: owingUser
      });
  
      let favoursForgiven = await FavourModel.countDocuments({ 
        $and: [
                {
                  $or: [{ requestUser: requestUser }, { owingUser: owingUser }]
                },
                {
                  debt_forgiven: true
                }
              ]
      });
  
      leaderboardArray.push({ id: i + 1, _id: users[i]._id, user: users[i].firstname + " " + users[i].lastname.substring(1, 0), favoursForgiven: favoursForgiven, favourCredits: favourCredits, favourDebits: favourDebits });
    }
    
    const leaderboard = sortObjectsArray(leaderboardArray, "favoursForgiven", "desc");

    responseJSON(res,leaderboard);

  } catch (err) {
    responseJSON(res, err);
  }
  
}

/******************************************************************************************************************
 * Returns an array of user emails that the user should join a party with
 * 
 * @param {array} req contains userId of the active user
 * @return {array} partyDetection an array of user emails, the active user should join a party with
 * 
 ******************************************************************************************************************/
exports.partyDetection = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.body._id);

  let extractColumn = (arr, column) => arr.map(x => x[column]);

  let userFavours = await FavourModel.find({ $or: [{ requestUser: userId }, { owingUser: userId }]});
  
  if (userFavours) {
    
    const requestUsers = extractColumn(userFavours, "requestUser");
    const owingUsers = extractColumn(userFavours, "owingUser");
    
    let userArray = [];
    let finalUserArray = [];
    for (let i = 0; i < requestUsers.length; i++) {
      if (!userArray.includes(requestUsers[i].toString())) {
        userArray.push(requestUsers[i].toString());
      }

      if (!userArray.includes(owingUsers[i].toString())) {
        userArray.push(owingUsers[i].toString());
      }
    }

    let range = userArray.length > 3? 4 : userArray.length;

    for (let i = 0; i < range; i++) {
      if (userArray[i] !== userId.toString()) {
        finalUserArray.push(userArray[i]);
      }
    }
    
    const userEmails = await UserModel.find({_id: { $in: finalUserArray }});

    const partyDetection = extractColumn(userEmails, "email");

    if (range >= 4) {
      res.send(partyDetection);    
    } else {
      res.send(["Not enough data to generate party"]);    
    }   
    
  }
}

/**********************************************************************************************************
 * Returns a success message whether the new activity was written to the database
 * 
 * @param {array} req contains userId and the action performed
 * @return {string} success status message sent back to requester
 * 
 **********************************************************************************************************/
exports.createUserActivity = async (req, res) => {
  const userId = req.body.userId;
  const action = req.body.action;

  const user = await UserModel.findOne({ _id: userId });
  if (!user) return res.send({ message: "User could not be found" });    

  const userActivity = new UserActivityModel({
      userId: userId,
      action: action,
      time: new Date(),
    });

    try {
      const savedUserActivity = await userActivity.save();
      return res.send({ message: "Success" });
      // welcomeEmail(userData);
    } catch (err) {
      return res.send(err);
    }

}

/*************************************************************************************************************
 * Returns an array of user activity unordered
 * 
 * @param {array} req the object id of the current user
 * @return {array} userActivity array of the userActivity details
 * 
 *************************************************************************************************************/
exports.getUserActivity = async (req, res) => {
  const userId = req.body._id;
  const user = await UserModel.findOne({ _id: userId });

  if (user) {
    const userActivity = await UserActivityModel.find({ userId: userId });

    if (userActivity) {
      responseJSON(res, userActivity);
    }
  }
}
