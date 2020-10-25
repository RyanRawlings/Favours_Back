const express = require("express");
const router = express.Router();

const upload = require("../../services/FileUpload");

/***********************************************************************************************************************************************
 * Solution inspired by https://stackoverflow.com/questions/60029300/how-to-send-multiple-files-to-aws-s3-using-multer-s3-from-different-fields
 * 
 * Returns an array of data to requester on success
 * 
 * @param {form} req the files with 'image' key, to be uploaded to s3
 * @return {string} ok on success string
 * @return {array} fileArray array of the file names uploaded to s3
 * @return {array} locationArray array of the s3 url for the files uploaded
 * 
 ************************************************************************************************************************************************/

const fileUpload = upload.array("image", 10);

exports.uploadS3Images = async (req, res) => {
  fileUpload(req, res, error => {
    if (error) {
      return res
        .status(422)
        .send({
          errors: [{ title: "File upload error", detail: error.message }]
        });
    } else {
      // If File not found
      if (req.files === undefined) {
        console.log("Upload Error: No File Selected!");
        res.status(500).json({
          status: "fail",
          message: "Error: No File Selected"
        });
      } else {
        // If Success
        let fileArray = req.files,
          fileLocation;
        const images = [];
        for (let i = 0; i < fileArray.length; i++) {
          fileLocation = fileArray[i].location;
          console.log("filename", fileLocation);
          images.push(fileLocation);
        }
        // Return image data to client
        return res.status(200).json({
          status: "ok",
          filesArray: fileArray,
          locationArray: images
        });
      }
    }
  });
};
