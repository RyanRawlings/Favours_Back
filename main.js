const express = require("express");
const app = express();
const port = 4000;
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("express-jwt");
require("dotenv/config");

dotenv.config();

//whole route
var indexRouter = require("./routes/index");

//Middleware
app.use(cors());
app.use(express.json());
app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

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
  useNewUrlParser: true
});

//Import routes - Data
const getsRoute = require("./routes/gets");
app.use("/api/get", getsRoute);

const awsS3GetImageRoute = require("./routes/get-s3-image");
app.use("/api/get", awsS3GetImageRoute);

const awsS3DeleteImageRoute = require("./routes/delete-s3-image");
app.use("/api/get", awsS3DeleteImageRoute);

//Import Routes - Authentication
// const authRoute = require('./routes/auth');
// app.use('/api/user', authRoute);

//Import routes
//Posts
const fileRoute = require("./routes/image-upload");
app.use("/api/file", fileRoute);

const fileUpdateKeyRoute = require("./routes/image-update-key");
app.use("/api/file", fileUpdateKeyRoute);

const deleteFavourRoute = require("./routes/delete-favour");
app.use("/api/favour/", deleteFavourRoute);

app.use("/", indexRouter);
app.listen(port, () => console.log(`API running on http://localhost:${port}`));
