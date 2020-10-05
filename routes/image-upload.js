const express = require('express');
const router = express.Router();

const upload = require('../services/FileUpload');

const singleFileUpload = upload.single('image');

router.post('/image-upload', async function (req, res) {    
    singleFileUpload(req, res, function (err) {
        // console.log(req.file);
        if (err) {
            return res.status(422).send({errors: [{title: 'File upload error', detail: err.message}]});
        }        
        if (req.file) {
            return res.json({'imageUrl': req.file.location});
        }
        else {
            return res.json({'imageUrl': null});
        }            
    });
});

module.exports = router;