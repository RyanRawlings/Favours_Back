const router = require("express").Router();
const MongoClient = require("mongodb").MongoClient;

//Connection URL
const url = process.env.DB_CONNECTION;

//Database Name
const dbName = 'Favours';

/**
 * Api to get all public request's rewards
 * @desc takes public request's id and returns all rewards for that public request from database
 * @param int _id
 * @return array object
 */
router.post("/get-publicRequest-rewards", async (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db("Favours");
        dbo.collection("publicRequests").findOne({_id: req.body._id}).aggregate([
            {
                $lookup:
                    {
                        from: 'favourType',
                        localField: 'item',
                        foreignField: '_id',
                        as: 'rewardName'
                    }
            }
        ]).toArray(function (err, res) {
            if (err) throw err;
            console.log(JSON.stringify(res));
            db.close();
        });
    });
});

// export "/get-publicRequest-rewards" router
module.exports = router;