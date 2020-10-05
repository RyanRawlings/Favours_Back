const express = require('express');
const router = express.Router();
const Favour = require('../models/Favour');

router.post('/image-update-key', async function (req, res) {
    // console.log(req.body);
    const { FavourId } = req.body;
    const { FavourImageKey } = req.body;
    // console.log(FavourId, FavourImageKey);
    const favourExists = await Favour.findOneAndUpdate({_id: FavourId}, {FavourImageKey: FavourImageKey});
    if (!favourExists) return res.status(400).send('Favour does not exist');

    return res.send("Check mongo db to see if it has updated!");
});

module.exports = router;