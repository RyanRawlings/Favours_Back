const UserModel = require("../../models/User.js");
const UserActivityModel = require("../../models/UserActivity.js");
const FavourModel = require("../../models/Favour.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../../validation");
const sortObjectsArray = require('sort-objects-array');
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

/*******************************************************************************************
 * Sign up or registration
 * 
 * @desc takes user information and save them into database and create new user
 * @param string firstname, string middlename(optional), string lastname, string email, string password
 * @return int user - user id or status 400 error
 * 
 *******************************************************************************************/
exports.userRegister = async (req, res) => {  
  // console.log("register called inside controller...")

  // Validate the data before passing the request to the DB
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
    res.send({ savedUser: savedUser });
  } catch (err) {
    res.status(400).send(err);
  }
};

/*************************************************************************************************
 
 * Login
 * @desc takes user's email and password, match them in database, if information are correct then create a token and save it in cookie
 * @param string email, string password
 * @return string token - assigned in cookie, object user - user id, first name, last name, email
 
 *************************************************************************************************/

exports.userLogin = async (req, res) => {
  // console.log("login called inside controller...")
  
  // Validate the data before passing the request to the DB
  console.log("Data request recieved...",req.body);

  const { error } = loginValidation(req.body);
  if (error) return res.send({message: error.details[0].message});

  // Check if email exists
  try{
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
  }catch(err){
    res.status(400).send(err);
  }

};


/**
 * Logout
 * @desc clears login token from cookie
 */
exports.userLogout = async (req, res) => {
  res.clearCookie();
};

/****************************************************************************************************
 * Update user profile image
 * 
 * @dec upload image and Returns a success status message indicating whether the database update completed successfully
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
  try {

      const user = await UserModel.findOneAndUpdate(filter, update);
      if (user) {
        console.log(user);
        return responseJSON(res, { message: "Successfully uploaded image" });
      } else {
        return responseJSON(res, { message: "Error in uploading image" });
      }
  } catch (err) {
    res.status(400).send(err);
  }

  
};

/***************************************************************************************************************
 * Get all users 
 * 
 * @dec  Returns an array of all users list
 * @param {array} req unused
 * @param {array} res response 
 * @return {array} userEmailArray -> returns an array of object arrays that contain the userId and userEmail
 * 
 ***************************************************************************************************************/
exports.getAllUsers = async (req, res) => {
  try {
      
      let result = await UserModel.find({});

      const userEmailArray = [];
      result.forEach(element => userEmailArray.push({
        _id: element._id,
        email: element.email,
      }));

      responseJSON(res, userEmailArray);    
  } catch (err) {
    res.status(400).send(err);
  }

}

/*****************************************************************************
 * Get user's emails
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
 * Get all user groups
 * 
 * @dec Returns an array of object arrays pertaining to each of the groups the active user is a part of
 * @param {array} req contains the id of the active user
 * @param {array} res response 
 * @return {array} resultDocument.groups -> returns the nested group documents that have been populated with the relevant group data
 * 
 *******************************************************************************************************************/
exports.getUserGroups = async (req, res) => {
  
  const userId = req.body.userId;

  try{
    const filter = { _id: mongoose.Types.ObjectId(userId) };

    const result = await UserModel.findOne(filter);
  
    await result.populate('groups')
                .execPopulate()
                .then(resultDocument => {
                  console.log(resultDocument.groups);
                  responseJSON(res, resultDocument.groups);
                })
                .catch(error => { 
                  res.send("Error occurred");
                });
  }catch(err){
    res.status(400).send(err);
  }

}

/***************************************************************************************************
 * Get all user by each group id
 * @dec  Returns an array of arrays containing all the users for each groupId in the request 
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
    try{
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
    }catch(err){
    res.status(400).send(err);
  }
    if (groupArrays) {
      responseJSON(res, groupArrays);
    }
}

/***************************************************************************************
 * Get active user
 * 
 * @dec Returns an object array about the active user account
 * @param {array} req contains the userId of the active user
 * @param {array} res response 
 * @return {array} result -> information about the user account
 * 
 **************************************************************************************/
exports.getUser = async (req, res) => {
  try{
    let result = await UserModel.findOne(req.body);
  
    if (result) {
      res.send(result);
    }
  }catch(err){
    res.status(400).send(err);
  }

}

/******************************************************************************************************************
 * Get all userleaderboard 
 * 
 * @dec get all userleaderboard from user
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
 * Party detection
 * 
 * @desc array of user emails that the user should join a party with
 * @param {array} req contains userId of the active user
 * @return {array} partyDetection an array of user emails, the active user should join a party with
 * 
 ******************************************************************************************************************/
exports.partyDetection = async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.body._id);

  let extractColumn = (arr, column) => arr.map(x => x[column]);
  try{
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
  }catch(err){
    res.status(400).send(err);
  }

}

/**********************************************************************************************************
 * Create user activity
 * 
 * @dec Returns a success message whether the new activity was written to the database
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
    } catch (err) {
      return res.send(err);
    }

}

/*************************************************************************************************************
 * Get user activity
 * 
 * @dec Returns an array of user activity unordered
 * @param {array} req the object id of the current user
 * @return {array} userActivity array of the userActivity details
 * 
 *************************************************************************************************************/
exports.getUserActivity = async (req, res) => {
  const userId = req.body._id;
  try{

    const user = await UserModel.findOne({ _id: userId });

    if (user) {
      const userActivity = await UserActivityModel.find({ userId: userId });
  
      if (userActivity) {
        responseJSON(res, userActivity);
      }
    }

  }catch(err){
    res.status(400).send(err);
  }

}
