const express = require('express');
const router = express.Router();
const aws = require('aws-sdk');

// set aws secretAccessKey, accessKeyId and region
aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'us-east-2'
});

// new aws object
const s3 = new aws.S3();

/************************************************************
 * Method is currently unused as, the frontend currently
 * just takes a publicly accessible url, that does not
 * require any authentication
 * 
 * @desc takes image key and get image from aws
 * @param string key
 * @return string data(base64)
 ***********************************************************/
router.post("/get-s3-image", async (req, res) => {
    console.log('Get Image Route called successfully...');
    let errorMessage; // error message for response

    req.setTimeout(10 * 1000); // times out after 10secs

    req.socket.removeAllListeners('timeout'); // This is the work around
    req.socket.once('timeout', () => {
        req.timedout = true;
    });

    try {
        console.log(req.body);
        const params = {
            Bucket: 'favour-request-user-images',
            Key: req.body.key
        }

        // get image from aws
        s3.getObject(params, function (err, data) {
            console.log('Starting image fetch from s3...');
            if (data === null || data === undefined) {
                errorMessage = "Image does not exist on s3...";
            } else {
                const base64 = data.Body.toString('base64');
                const mimeType = data.Metadata.mimetype;

                console.log("Image loaded from s3...");

                if (mimeType === "image/jpeg") {
                    res.send({data: `data:${mimeType};base64,${base64}`});
                } else if (mimeType === "image/png") {
                    res.send({data: `data:${mimeType};base64,${base64}`});
                } else if (mimeType === "image/gif") {
                    res.send({data: `data:${mimeType};base64,${base64}`});
                } else {
                    res.send("Invalid file format")
                }
            }
        })
    } catch (err) {
        res.status(504).send({"Error Message": "Server took too long to respond..."});
    }
})

// export "/get-s3-image" router
module.exports = router;