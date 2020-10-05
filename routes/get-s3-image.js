const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'ap-southeast-2'
});

const s3 = new aws.S3();

router.get("/get-s3-image", async (req, res) => {
    const params = {
        Bucket: 'favours-user-images',
        Key: req.body.key
    }

    s3.getObject(params, function (err, data) {
        if (err) console.log(err, err.stack);
        else console.log("Image loaded from s3...");
        res.send(data.Body.toString('utf-8'));
    })
})

module.exports = router;