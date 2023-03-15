const express       = require('express');               // Express is a framework for creating web apps

// Get dependencies that are needed for the submission route
const fileUpload    = require('express-fileupload');    // Middleware for uploading file content / parsing multiform data in requests
const path          = require('path');                  // Path is used for creating file paths
const fs            = require('fs');                    // fs is needed for reading files from the file system

// Create a router to handle requests
const router = express.Router();            

// Todo: Change file upload limit to 5? MB when understanding why openshift server is not able to handle files larger than 1MB. nginx client_max_body_size?  

// Configure the file upload middleware
const maxFileSizeMB = 5;
const sizeLimitMessage = `File size limit exceeded. Maximum file size is ${maxFileSizeMB} MB.`

const maxFileSize = maxFileSizeMB * 1024 * 1024; // File size in MB
const uploadOptions = { limits: { fileSize: maxFileSize }, debug:true, useTempFiles:true, abortOnLimit:true, responseOnLimit:sizeLimitMessage}
router.use( fileUpload(uploadOptions) );

// Export the router so it can be used in the main app
module.exports = router;

router.post('/previewImage', (req, res) => {
    console.log('Received post-request for upload of preview image from client')

    let saveDirPath = path.join(__dirname, '..', '..', "/tmp", "/upload")
    let saveFilePath = path.join(saveDirPath, req.files.file.name)

    fs.mkdirSync(saveDirPath, { recursive: true })
    fs.writeFile( saveFilePath, req.files.file.data, (err) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        } else {
            console.log("File written successfully\n");
            let responseObject = {
                "name": req.files.file.name,
                "status": "done",
                "url": "",
                "thumbUrl": ""
            };
            res.send( responseObject );
        }
    });
});
