const express = require("express");
const bodyParser = require("body-parser");
const router = express.Router();
// const jwtauth = require("../middleware/jwtauth");

const api = require("require-all")({
  dirname: __dirname + "/api"
});

//User API
router.post("/api/user/register", api.user.userRegister);
router.post("/api/user/login", api.user.userLogin);
router.get("/api/user/profile", api.user.getUserProfile);
router.get("/api/user/get", api.user.getUsers);

//Public Request API
router.get("/api/publicRequest/get", api.publicRequest.getPublicRequests);
router.post("/api/publicRequest/create", api.publicRequest.createPublicRequest);
router.post("/api/publicRequest/delete", api.publicRequest.deletePublicRequest);

//Favour API
router.post("/api/favour/get", api.favour.getFavours);
router.post("/api/favour/create", api.favour.createFavour);

module.exports = router;
