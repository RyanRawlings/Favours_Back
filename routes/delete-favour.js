const express = require('express');
const router = express.Router();
const {MongoClient, ObjectId} = require('mongodb');
require('dotenv/config');

//Connection URL
const url = process.env.DB_CONNECTION;

//Database Name
const dbName = 'Favours';

/**
 * Api for deleting favour
 * @desc takes id and delete from favours table
 * @param int _id
 * @return boolean ok, string message
 */
router.post("/delete", (req, res) => {
    MongoClient.connect(url, {useUnifiedTopology: true, useNewUrlParser: true}, function (err, client) {

        if (err) {
            console.log("Unsuccessful connection attempt to MongoDB -> fetching the favour debits");
            throw err;
        } else {
            console.log("Successful connection made to MongoDB -> fetching the favour debits");
        }

        let db = client.db(dbName);
        let deleteId = new ObjectId(req.body._id);

        db.collection('favours').findOneAndDelete({_id: deleteId}, function (err, result) {
            if (err) throw err;
            res.send(result.ok === 1 ? {ok: true, message: "Successfully deleted"} : {ok: false, message: err});
            client.close();
        });
    })
});

// export "/delete" router
module.exports = router;
  