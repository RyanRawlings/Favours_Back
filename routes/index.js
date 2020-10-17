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

//Public Request API
router.get("/api/publicRequest", api.publicRequest.getPublicRequests);

//Favour API
router.post("/api/favour", api.favour.getFavours);

module.exports = router;
