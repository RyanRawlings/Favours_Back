const express = require("express");
const router = express.Router();

const upload = require("../../services/FileUpload");

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
        console.log("uploadProductsImages Error: No File Selected!");
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
        // Save the file name into database
        return res.status(200).json({
          status: "ok",
          filesArray: fileArray,
          locationArray: images
        });
      }
    }

    // if (req.file) {
    //     return res.json({'key': req.file.key});
    // } else {
    //     return res.json({'key': null});
    // }
  });
};

// router.post('/image-upload', async function (req, res) {
// console.log(file);

// singleFileUpload(req, res, function (err) {
//     // console.log("Data from post: ", req);
//     if (err) {
//         return res.status(422).send({errors: [{title: 'File upload error', detail: err.message}]});
//     }
//     if (req.file) {
//         // return res.json({'imageUrl': req.file.location});
//         return res.json({'key': req.file.key});
//     }
//     else {
//         // return res.json({'imageUrl': null});
//         return res.json({'key': null});
//     }
// });
// });

// module.exports = router;
