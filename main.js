const express = require("express");
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
require('dotenv/config');

dotenv.config();

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
    saveUninitialized: true
}));

//Connect to MongoDB instance
mongoose.connect(process.env.DB_CONNECTION, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
});

// API Routes controller
var indexRouter = require("./routes/index");

app.use("/", indexRouter);

app.listen(port, () => console.log(`API running on http://localhost:${port}`));
