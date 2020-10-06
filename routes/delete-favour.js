const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');
const verify = require('./verifyToken');
require('dotenv/config');

//Connection URL
const url = process.env.DB_CONNECTION;

//Database Name
const dbName = 'Favours';
  
router.post("/delete", (req, res) => {
    // User.findByOne({_id: req.user});
    MongoClient.connect(url, { useUnifiedTopology: true, useNewUrlParser: true }, function(err, client){
        
        if(err) {
            console.log("Unsuccessful connection attempt to MongoDB -> fetching the favour debits");
            throw err;
        } else {
            console.log("Successful connection made to MongoDB -> fetching the favour debits");
        }

        let db = client.db(dbName);
        // console.log(req.body._id);
        let deleteId = new ObjectId(req.body._id);

        db.collection('favours').findOneAndDelete({_id: deleteId} , function(err, result) {
          if(err) throw err;
        //   console.log(result);
          res.send(result.ok === 1? { ok: true, message: "Successfully deleted"} : {ok: false, message: err});
          client.close();
          });
       })
});

module.exports = router;
  