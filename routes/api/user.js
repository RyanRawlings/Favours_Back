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
// const sortObjectArray = require('objectarray-sort');

const welcomeEmail = require("../api/email").welcomeEmail;
const mongoose = require("mongoose");
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
    // welcomeEmail(userData);
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
      email: user.email,
      groups: user.groups
    }
  });

  // res.header('auth-token', token).send(token);

  console.log("User logged in and token assigned");
};

exports.updateUserProfileImage = async (req, res) => {
  // console.log("response from client: " + req.body._id + req.body.imageUrl);
  const userId = mongoose.Types.ObjectId(req.body._id);
  const profileImageUrl = req.body.imageUrl;

  const filter = { _id: userId };
  const update = { profileImageUrl: profileImageUrl }

  const user = await UserModel.findOneAndUpdate(filter, update);
  // const user = await UserModel.findOneAndUpdate({_id: userId }, { imageUrl: imageUrl }, {
  //   new: true
  // });

  if (user) {
    console.log(user);
    return responseJSON(res, { message: "Successfully uploaded image" });
  } else {
    return responseJSON(res, { message: "Error in uploading image" });
  }
  
};

exports.getUserProfile = async (req, res) => {
  let result = await UserModel.find({ firstname: "Wei" }).populate({
    path: "group",
    model: "UserGroup"
  });

  return responseJSON(res, result);
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

exports.getGroupUsers = async (req, res) => {
  console.log("get group users is being called");
    
    // console.log(req.body);
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

    // const result = await UserModel.find(filter);

    // let groupUsersEmailArray = extractColumn(result, "email" );

    if (groupArrays) {
      console.log(groupArrays)
      responseJSON(res, groupArrays);
    }
  // } catch (err) {
  //   res.send({ message: err })
  // }
}

exports.getUser = async (req, res) => {
  console.log("get user is being called");
  console.log(req.body);
  // console.log(req.body);
  let result = await UserModel.findOne(req.body);
  
  if (result) {
    res.send(result);
  }
}

exports.userLeaderboard = async (req, res) => {

  try {
    let users = await UserModel.aggregate([
      { $project: { email: 1, firstname: 1, lastname: 1 } }
    ]);
  
    // let favourCount = await FavourModel.find();
  
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
    // const leaderboard = sortObjectArray(leaderboardArray, ["favoursForgiven", "favoursDebits"], ["desc", "desc"])
    console.log(leaderboard);

    responseJSON(res,leaderboard);
  } catch (err) {
    responseJSON(res, err);
  }
  
}

exports.partyDetection = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.body._id);

  let extractColumn = (arr, column) => arr.map(x => x[column]);

  let debitsArray = [];
  let creditsArray = [];
  let userFavours = await FavourModel.find({ $or: [{ requestUser: userId }, { owingUser: userId }]});
  
  if (userFavours) {
    // console.log(userFavours)
    for (let i = 0; i < userFavours.length; i++) {
      if ( userFavours[i].requestUser !== userId && userFavours[i].is_forgiven !== true && userFavours[i].is_completed !== true) {
        console.log("request user: ", userFavours[i].requestUser)
        debitsArray.push({ 
          userId: userFavours[i].owingUser,
          favourType: userFavours[i].favourOwed,          
        });
        }

    if ( userFavours[i].requestUser === userId && userFavours[i].is_forgiven !== true && userFavours[i].is_completed !== true ) {
      console.log("owing user: ", userFavours[i].owingUser)
      creditsArray.push({ 
          userId: userFavours[i].owingUser,
          favourType: userFavours[i].favourOwed,
        });
      }
    }

    console.log(debitsArray, creditsArray);

  }
}

exports.createUserActivity = async (req, res) => {
  console.log(req.body);
  // console.log(req.body);
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

exports.getUserActivity = async (req, res) => {
  const userId = req.body._id;
  // console.log(userId);
  const user = await UserModel.findOne({ _id: userId });

  if (user) {
    const userActivity = await UserActivityModel.find({ userId: userId });

    if (userActivity) {
      responseJSON(res, userActivity);
    }
  }
  // } else {
  //   res.send({ message: "Error retriving activity"});
  // }
}

// exports.forgotPassword = async (req, res) => {
//     const email = req.body.email;

//     UserModel.findOne({email: email}, (err, user) => {
//       if (err || !user) {
//         return res.status(400).json({message: "Email does not exist" });        
//       }

//       const token = jwt.sign({_id: user._id}, process.env.RESET_PASSWORD_KEY, {expiresIn: "20m"});
//       const emailData = {
//         from: "noreply@favours.com.au",
//         to: email,
//         subject: "Password Reset Link",
//         html: `
//         <h2>Please click on given link to reset your password</h2>
//         <p>${process.env.CLIENT_URL}/authentication/password-reset/${token}</p>
//         `  
//     };    
//     return user.updateOne({resetLink: token}, (err, success) => {
//       if (err) {
//         return res.status(400).json({message: "Reset password link error" });        
//       } else {

//       }

//     })
// }

// const forgot = require('password-reset')({
//   uri : 'http://localhost:4000/password_reset',
//   from : 'password-reset@favours.com.au',
//   host : 'localhost', port : 25,
// });

// app.use(forgot.middleware);

// exports.forgotPassword = async (req, res) => {
//   const email = req.body.email;

//   // Check if email exists
//   const user = await UserModel.findOne({ email: email });
//   if (!user) return res.send({ message: "Email is not found"});

//   //Email found send reset
//   const reset = forgot(email, function (err) {
//     if (err) res.end('Error sending message: ' + err)
//     else res.end('Check your inbox for a password reset message.')
//   });

//   reset.on('request', function (req_, res_) {
//     req_.session.reset = { email : email, id : reset.id };
//     fs.createReadStream(__dirname + '/forgot.html').pipe(res_);
//   });
// }

// exports.resetPassword = async (req, res) => {
//     const email = req.body.email;
//     const password = req.body.password;
//     const confirm = req.body.confirm;

//     if (password !== confirm) return res.end("Passwords do not match");
//     if (password.length < 8) return res.end("Password must be at least 8 characters");

//     //Hash passwords
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     //Set hashed password in db
//     const update = await UserModel.findOneAndUpdate({ email: email }, { password: hashedPassword }).exec(function(err, user) {
//       if(err) {
//         res.status(500).send(err);
//       } else {
//         res.status(200).send({ message: "Successfully reset password"});
//       }
//     });

//     forgot.expire(req.session.reset.id);
//     delete req.session.reset;
//     res.end('password reset');
// };