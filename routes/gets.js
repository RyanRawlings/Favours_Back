const express = require("express");
const router = express.Router();
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");
const verify = require("./verifyToken");

require("dotenv/config");

//Connection URL
const url = process.env.DB_CONNECTION;

//Database Name
const dbName = "Favours";

router.get("/", (req, res) => {
  res.send("Hello I am the default get response...");
});

router.get("/count", (req, res) => {
  res.json({
    count: "yes"
  });
});

router.get("/debit_list", (req, res) => {
  // User.findByOne({_id: req.user});
  MongoClient.connect(
    url,
    { useUnifiedTopology: true, useNewUrlParser: true },
    function(err, client) {
      if (err) {
        console.log(
          "Unsuccessful connection attempt to MongoDB -> fetching the favour debits"
        );
        throw err;
      } else {
        console.log(
          "Successful connection made to MongoDB -> fetching the favour debits"
        );
      }
      let db = client.db(dbName);
      db.collection("favours")
        .find({})
        .toArray(function(err, result) {
          if (err) throw err;
          res.json({ allFavours: result });
          client.close();
        });
    }
  );
});

module.exports = router;
