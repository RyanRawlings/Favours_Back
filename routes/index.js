const express = require("express");
const router = express.Router();

const api = require("require-all")({
    dirname: __dirname + "/api"
});

//User API
router.post("/api/user/register", api.userController.userRegister);
router.post("/api/user/login", api.userController.userLogin);
router.post("/api/user/logout", api.userController.userLogout);
router.get("/api/user/get", api.userController.getAllUsers);
router.post("/api/user/get/user-emails", api.userController.getUserEmails);
router.get("/api/user/get-leaderboard", api.userController.userLeaderboard);
router.post("/api/user/get-one", api.userController.getUser);
router.post("/api/user/groups", api.userController.getUserGroups);
router.post("/api/user/group-users", api.userController.getGroupUsers);
router.post("/api/user/upload-profile-image", api.userController.updateUserProfileImage);
router.post("/api/user/get/activity", api.userController.getUserActivity);
router.post("/api/user/create/activity", api.userController.createUserActivity);
router.post("/api/user/party-detection", api.userController.partyDetection);

//Public Request API
router.get("/api/publicRequest/get", api.publicRequestController.getPublicRequests);
router.post("/api/publicRequest/create", api.publicRequestController.createPublicRequest);
router.post("/api/publicRequest/delete", api.publicRequestController.deletePublicRequest);
router.post("/api/publicRequest/add-reward", api.publicRequestController.addReward);
router.post("/api/publicRequest/claim", api.publicRequestController.claimPublicRequest);

//Favour API
router.post("/api/favour/get", api.favourController.getFavours);
router.post("/api/favour/create", api.favourController.createFavour);
router.post("/api/favour/forgive-debt", api.favourController.forgiveDebt);
router.post("/api/favour/delete", api.favourController.deleteFavour);
router.get("/api/favour/get/favourType", api.favourController.getFavourType);

// Image API
router.post("/api/image/upload", api.awsS3Controller.uploadS3Images);
router.post("/api/image/update/mongo", api.favourController.storeImageData);

module.exports = router;
