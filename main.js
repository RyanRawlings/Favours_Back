const express = require("express");
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('express-jwt');
const session = require('express-session');
require('dotenv/config');


dotenv.config();

//whole route
var indexRouter = require("./routes/index");

//Middleware
app.use(cors());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true
 }));
app.use(session({ 
                resave: true,
                secret: process.env.TOKEN_SECRET,
                saveUninitialized: true }));

// app.use(
//     jwt(
//       secret: process.env.TOKEN_SECRET,
//       getToken: req => req.cookies.token,
//       algorithms: ['RS256']
//     })
//   );

//Connect to MongoDB instance
mongoose.connect(process.env.DB_CONNECTION, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false,
});

//Import routes - Data
const getsRoute = require("./routes/gets");
app.use("/api/get", getsRoute);

const getFavourTypeRoute = require("./routes/get-favourType");
app.use("/api/get", getFavourTypeRoute);

const awsS3GetImageRoute = require("./routes/get-s3-image");
app.use("/api/get", awsS3GetImageRoute);

const awsS3DeleteImageRoute = require("./routes/delete-s3-image");
app.use("/api/get", awsS3DeleteImageRoute);

//Import Routes - Authentication
const authRoute = require('./routes/auth');
app.use('/api/user', authRoute);

//Import routes
//Posts
// const fileRoute = require("./routes/image-upload");
// app.use("/api/file", fileRoute);

const fileUpdateKeyRoute = require("./routes/image-update-key");
app.use("/api/file", fileUpdateKeyRoute);

const deleteFavourRoute = require("./routes/delete-favour");
app.use("/api/favour", deleteFavourRoute);

const createPublicRequest = require("./routes/create-publicRequest");
app.use("/api/publicRequest", createPublicRequest);
const getPublicRequestRewards = require("./routes/get-publicRequest-rewards");
app.use("/api/publicRequest", getPublicRequestRewards);
const getPublicRequests = require("./routes/get-publicRequest");
app.use("/api/publicRequest", getPublicRequests);
const getPublicRequestUserEmails = require("./routes/get-user-emails");
app.use("/api/publicRequest", getPublicRequestUserEmails);


app.use("/", indexRouter);

app.listen(port, () => console.log(`API running on http://localhost:${port}`));
