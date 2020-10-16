const express = require('express');
const router = express.Router();
const PublicRequest = require('../models/PublicRequest');
const mongoose = require("mongoose");

router.post('/image-update-key', async function (req, res) {
    // console.log(req.body);
    const { FavourId } = req.body;
    const { FavourImageKey } = req.body;

    const filter = FavourId;
    const update = FavourImageKey;

    // console.log(FavourId, FavourImageKey);
    const favourExists = await PublicRequest.findOneAndUpdate(filter, update, { 
    new: true });

    if (!favourExists) {        
        return res.status(400).send('Favour does not exist');
    } else {
        favourExists.updateOne({
            proof: {
                uploaded: true,
                uploadImageKey: update,
                snippet: "Test",
                uploadedBy:  mongoose.Types.ObjectId("5f79c7e57c60dd378c8e4584")
            }
        })
        return res.send("Check mongo db to see if it has updated!");
    }
});

module.exports = router;