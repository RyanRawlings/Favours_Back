const express = require('express');
const router = express.Router();

const upload = require('../services/FileUpload');

const fileUpload = upload.array('image', 10);

/**
 * @desc takes file and returns files location
 * @param file files
 * @return string status, array filesArray, array locationArray
 */
exports.uploadS3Images = async (req, res) => {
    fileUpload(req, res, (error) => {
        if (error) {
            return res.status(422)
                .send({
                    errors: [{title: 'File upload error', detail: err.message}]
                });
        } else {
            // If File not found
            if (req.files === undefined) {
                console.log('uploadProductsImages Error: No File Selected!');
                res.status(500).json({
                    status: 'fail',
                    message: 'Error: No File Selected'
                });
            } else {
                // If Success
                let fileArray = req.files,
                    fileLocation;
                const images = [];
                for (let i = 0; i < fileArray.length; i++) {
                    fileLocation = fileArray[i].location;
                    console.log('filenm', fileLocation);
                    images.push(fileLocation)
                }
                // Save the file name into database
                return res.status(200).json({
                    status: 'ok',
                    filesArray: fileArray,
                    locationArray: images
                });
            }
        }

    })
}

module.exports = router;