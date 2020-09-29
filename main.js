const express = require("express");
const app = express();
const port = 4000;
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');

//Middlewares
app.use(cors());
app.use(bodyParser.json());

//Import routes
const getsRoute = require('./routes/gets');
app.use('/api/get', getsRoute);

//Import routes
//Posts


app.listen(port, () => console.log(`API running on http://localhost:${port}`));
