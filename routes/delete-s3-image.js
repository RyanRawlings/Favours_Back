const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');

// set aws secretAccessKey, accessKeyId and region
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'ap-southeast-2'
});

// new aws object
const s3 = new aws.S3();

/**
 * Api for delete image from aws
 * @desc takes image key and delete from aws
 * @param string key
 * @return string
 */
router.post("/delete-s3-image", async (req, res) => {
    // error message for response
    let errorMessage;

    // times out after 10secs
    req.setTimeout(10 * 1000);

    req.socket.removeAllListeners('timeout');
    req.socket.once('timeout', () => {
        req.timedout = true;
    });

    try {
        const params = {
            Bucket: 'favours-user-images',
            Key: req.body.key
        }

        // delete image from aws
        s3.deleteObject(params, function (err, data) {
            if (data === null || data === undefined) {
                errorMessage = "Image does not exist on s3...";
            } else {
                const base64 = data.Body.toString('base64');
                const mimeType = data.Metadata.mimetype;

                console.log("Image loaded from s3...");

                if (mimeType === "image/jpeg") {
                    res.send(`data:${mimeType};base64,${base64}"`);
                } else if (mimeType === "image/png") {
                    res.send(`data:${mimeType};base64,${base64}"`);
                } else if (mimeType === "image/gif") {
                    res.send(`data:${mimeType};base64,${base64}"`);
                } else {
                    res.send("Invalid file format")
                }
            }
        })
    } catch (err) {
        res.status(504).send({"Error Message": "Server took too long to respond..."});
    }
})

// export "/delete-s3-image" router
module.exports = router;