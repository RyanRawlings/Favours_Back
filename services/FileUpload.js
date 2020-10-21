const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

require('dotenv/config');

aws.config.update({
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: 'us-east-2'
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        // console.log("file: ",file);
        cb(null, true);
    } else {
        cb(new Error('Invalid Mime Type, only JPEG and PNG'), false);
    }
}

const upload = multer({
    fileFilter,
    storage: multerS3({
        s3,
        bucket: process.env.BUCKET_NAME,
        acl: 'public-read',        
        metadata: function (req, file, cb) {
            // console.log("File: ", file);
            cb(null, {fieldName: file.fieldname, mimeType: file.mimetype});
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString())
        }
    })
});

module.exports = upload;