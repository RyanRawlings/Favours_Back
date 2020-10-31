const router = require("express").Router();
const MongoClient = require("mongodb").MongoClient;

//Connection URL
const url = process.env.DB_CONNECTION;

//Database Name
const dbName = "Favours";

/**
 * Api to get all favour type
 * @desc returns all favour types from favourType table
 * @param void
 * @return array object favourTypes
 */
router.get("/get-favourType", (req, res) => {
    MongoClient.connect(
        url,
        {useUnifiedTopology: true, useNewUrlParser: true},
        function (err, client) {
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
            db.collection("favourType")
                .find({})
                .toArray(function (err, result) {
                    if (err) throw err;
                    res.json({favourTypes: result});
                    client.close();
                });
        }
    );
})

// export "/get-favourType" router
module.exports = router;
