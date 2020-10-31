const express = require('express');
const router = express.Router();
const PublicRequest = require('../models/PublicRequest');
const mongoose = require("mongoose");

/**
 * Api for image key update
 * @desc takes image key and update in database
 * @param object
 * @return string
 */
router.post('/image-update-key', async function (req, res) {
    const {FavourId} = req.body;
    const {FavourImageKey} = req.body;

    const filter = FavourId;
    const update = FavourImageKey;

    const favourExists = await PublicRequest.findOneAndUpdate(filter, update, {
        new: true
    });

    if (!favourExists) {
        return res.status(400).send('Favour does not exist');
    } else {
        favourExists.updateOne({
            proof: {
                uploaded: true,
                uploadImageKey: update,
                snippet: "Test",
                uploadedBy: mongoose.Types.ObjectId("5f79c7e57c60dd378c8e4584")
            }
        })
        return res.send("Check mongo db to see if it has updated!");
    }
});

// export '/image-update-key' router
module.exports = router;