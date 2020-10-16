const router = require("express").Router();
const MongoClient = require("mongodb").MongoClient;
const mongoose = require("mongoose");

//Connection URL
const url = process.env.DB_CONNECTION;

//Database Name
const dbName = "Favours";

router.post("/get-user-emails", async (req, res) => {

    // console.log(req.body);

    const userIdList = [];
    const tempUserIdList = req.body;
    
    // Cast id strings as mongo ObjectId type
    for (let i = 0; i < tempUserIdList.length; i++) {
        userIdList.push(mongoose.Types.ObjectId(req.body[i]));
    }
    
    // Connect to MongoDb
    MongoClient.connect(
        url,
        { useUnifiedTopology: true, useNewUrlParser: true },
        function(err, client) {
          if (err) {
            console.log(
              "Unsuccessful connection attempt to MongoDB"
            );
            throw err;
          } else {
            console.log(
              "Successful connection made to MongoDB"
            );

            // Filter search on user collection passing the sanitised user Ids
            let db = client.db(dbName);
            db.collection("users")
                .find({ _id: { $in: userIdList }})
                .toArray(function(err, result) {
            
            if (err) throw err;
            
            // Create new smaller array
            let userArray = [];
            for (let i = 0; i < result.length; i++) {
                userArray.push({    
                _id: result[i]._id,
                firstname: result[i].firstname,
                email: result[i].email,
                    });
                }

                res.send(userArray);

                client.close();
            });
          }
        }
      );
    })

module.exports = router;
