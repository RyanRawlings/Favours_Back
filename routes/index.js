const express = require("express");
const router = express.Router();

const api = require("require-all")({
    dirname: __dirname + "/api"
});

//User API
router.post("/api/user/register", api.user.userRegister);
router.post("/api/user/login", api.user.userLogin);
router.get("/api/user/get", api.user.getUsers);
router.get("/api/user/get-leaderboard", api.user.userLeaderboard);
router.post("/api/user/get-one", api.user.getUser);
router.post("/api/user/groups", api.user.getUserGroups);
router.post("/api/user/group-users", api.user.getGroupUsers);
router.post("/api/user/upload-profile-image", api.user.updateUserProfileImage);
router.post("/api/user/get/activity", api.user.getUserActivity);
router.post("/api/user/create/activity", api.user.createUserActivity);
router.post("/api/user/party-detection", api.user.partyDetection);

//Public Request API
router.get("/api/publicRequest/get", api.publicRequest.getPublicRequests);
router.post("/api/publicRequest/create", api.publicRequest.createPublicRequest);
router.post("/api/publicRequest/delete", api.publicRequest.deletePublicRequest);
router.post("/api/publicRequest/add-reward", api.publicRequest.addReward);
router.post("/api/publicRequest/claim", api.publicRequest.claimPublicRequest);

//Favour API
router.post("/api/favour/get", api.favour.getFavours);
router.post("/api/favour/create", api.favour.createFavour);
router.post("/api/favour/forgive-debt", api.favour.forgiveDebt);

// Image API
router.post("/api/image/upload", api.awsS3.uploadS3Images);
router.post("/api/image/update/mongo", api.favour.storeImageData);

module.exports = router;
