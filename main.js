const express = require("express");
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('express-jwt');
require('dotenv/config');

dotenv.config();

//Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// app.use(
//     jwt({
//       secret: process.env.TOKEN_SECRET,
//       getToken: req => req.cookies.token,
//       algorithms: ['RS256']
//     })
//   );

//Connect to MongoDB instance
mongoose.connect(process.env.DB_CONNECTION, { useUnifiedTopology: true, useNewUrlParser: true });

//Import routes - Data
const getsRoute = require('./routes/gets');
app.use('/api/get', getsRoute);

//Import Routes - Authentication
const authRoute = require('./routes/auth');
app.use('/api/user', authRoute);

//Import routes
//Posts

app.listen(port, () => console.log(`API running on http://localhost:${port}`));
