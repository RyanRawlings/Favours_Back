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

module.exports = router;
