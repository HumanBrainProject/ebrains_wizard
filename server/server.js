// This script configures the backend server that is used for sending the 
// user-submitted metadata to the ebrains curation team

//  This script requires the following environment variables to be set:
//  - EMAIL_ADDRESS_SENDER
//  - EMAIL_ADDRESS_CURATION_SUPPORT

// Get installed node modules that are needed for the server
const express = require('express');        // Express is a framework for creating web apps
const path = require('path');              // Path is used for creating file paths
const fileUpload = require('express-fileupload'); // Middleware for uploading file content / parsing multiform data in requests
const atob = require('atob');              // atob is needed for decoding base64 encoded strings
const fs = require('fs');                  // fs is needed for reading files from the file system

// Get local modules that are needed for the server
var mailTransporter = require('./mail_setup/MailTransporter');

// This app is deployed on OpenShift, and containers in OpenShift should bind to
// any address (which is designated with 0.0.0.0) and use port 8080 by default
const ip = process.env.IP || '0.0.0.0';
const port = process.env.PORT || 8080;


// Create and configure the express app
// - - - - - - - - - - - - - - - - - - - - - - - - 

const app = express()

const uploadOptions = { limits: { fileSize: 50 * 1024 * 1024, debug:true } } // restrict size of uploaded files to 50 MB
app.use( fileUpload(uploadOptions) );

// Configure the renderer.
//app.set('view engine', 'ejs'); //Necessary??
//app.set('views', path.join(__dirname, '..', '/build'));  //Necessary??

// This specifies that the root directory for serving the files are the build folder (Important!)
app.use(express.static(path.join(__dirname, '..', '/build')));

// console.log that the server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));


// Define routes for the express app
// - - - - - - - - - - - - - - - - - - - - - - - - 

// Serve the react app on the default (/) route
app.get('/*', function(req, res) {
  //res.render( 'index.html' );
  res.sendFile( path.join(__dirname, '..', '/build', '/index.html' ) );
});

// Create a GET route for testing if express server is online
app.get('/api/express_test_connection', (req, res) => {
  console.log("Express server is connected.")
  res.send({ message: 'Express server says hello' });
});

// Create a POST route for receiving files that should be sent to curation team via email.
app.post('/api/sendmail', (req, res) => { 
  console.log('Received submission post request from client')

  let jsonObject = JSON.parse(req.body.jsonData);

  const emailCurationTeam = process.env.EMAIL_ADDRESS_CURATION_SUPPORT;
  const emailMetadataSubmitter = getContactPersonEmailAddress(jsonObject);

  // Create a string array with email addresses for the curation team and the user submitting metadata.
  const emailRecipients = [emailCurationTeam, emailMetadataSubmitter];

  let message = [createMetadataEmailMessage(jsonObject, req)];
  message.push( rewriteMailBodyForContactPerson(message[0], jsonObject) )

  // Send the message to each of the emailRecipients. NOTE: The sendResponseToClient function is called after each email has been sent, 
  // but the response will only be sent to the client for the first email. This is fine, because it is only important for the client to know
  // that the email has been sent to the curation team, but it is not important for the client to know if the email has been sent to the user.
  // This could be handled better in the future.
  for (let i = 0; i < emailRecipients.length; i++) {
    sendMetadataEmailMessage(emailRecipients[i], message[i], sendResponseToClient)
  }

  // Function that sends the response to the frontend client
  function sendResponseToClient(mailResponse) {
    console.log('Sending response to client')

    if (mailResponse.ok) {
      res.send({status: true, message: 'Email is sent'})
    } else {
      res.status(500).send(mailResponse.error.message)
    }
  }

});

app.post('/api/sendwizardlink', (req, res) => {
  console.log('Received wizard link post request from client')

  let jsonObject = JSON.parse(req.body.jsonData);

  let emailMessage = {
    from: process.env.EMAIL_ADDRESS_SENDER,
    to: jsonObject.emailRecipient,
    subject: 'test',
    text: jsonObject.emailMessage,
  };

  mailTransporter.sendMail(emailMessage, function(error, info){
    if (error) {
      console.log(`Failed to send mail with following error:\n`, error)
      mailResponse.error = error;
    } else {
      console.log(`Email sent: ${emailMessage.to}` + info.response)
      mailResponse.ok = true;
    }
  });
});




// Functions for creating and sending email messages

function createMetadataEmailMessage(jsonObject, requestObject) {
  // Create an email message object but leave the recipient empty for now.

  var message = {
    from: process.env.EMAIL_ADDRESS_SENDER,
    to: '',
    subject: writeMailSubject(jsonObject),
    text: writeMailBody(jsonObject),
    attachments: prepareMailAttachments(requestObject)
  };

  return message
}

function rewriteMailBodyForContactPerson(emailMessage, jsonObject) {
  let rewrittenMessage = {};
  Object.assign(rewrittenMessage, emailMessage);

  rewrittenMessage.text = writeMailBodyConfirmation(jsonObject)

  return rewrittenMessage
}

function sendMetadataEmailMessage(emailRecipient, emailMessage, sendResponseToClientFunction) {
  // Send the email message to the emailRecipient
  
  let mailResponse = {ok: false, error: null};

  try {
    // Change the recipient of the email message
    emailMessage.to = emailRecipient;

    mailTransporter.sendMail(emailMessage, function(error, info){
      if (error) {
        console.log(`Failed to send mail with following error:\n`, error)
        mailResponse.error = error;
      } else {
        console.log(`Email sent: ${emailMessage.to}` + info.response)
        mailResponse.ok = true;
      }
      sendResponseToClientFunction(mailResponse)
    });

  } catch (err) {
      console.log('Failed to send the message via email with the following error:\n', err)  
      mailResponse.error = err;
      sendResponseToClientFunction(mailResponse)
  }
}

// Define utility functions
// - - - - - - - - - - - - - - - - - - - - - - - - 

function getContactPersonEmailAddress(jsonObject) {

  let emailAddress = undefined;

  if (jsonObject[0]["general"]["contactperson"]["same"]) {
    emailAddress = jsonObject[0]["general"]["custodian"]["email"];
  } else {
    emailAddress = jsonObject[0]["general"]["contactperson"]["contactinfo"]["email"];
  }
  return emailAddress;
}

function writeMailSubject(jsonObject) {
  const dsTitle = jsonObject[0]["general"]["datasetinfo"]["datasetTitle"];
  let mailSubjectStr = `[Wizard Metadata Submission] ${dsTitle}`;

  let ticketNumber = jsonObject[0]["general"]["ticketNumber"];

  if (ticketNumber) {
    ticketNumber = cleanTicketNumber(ticketNumber);
    mailSubjectStr = mailSubjectStr + ` [Ticket#${ticketNumber}]`;
  }

  return mailSubjectStr
}

function writeMailBody(jsonObject) {
  // Add some key information to a mail body string
  
    // TODO: use contact person if available

  const dsTitle = jsonObject[0]["general"]["datasetinfo"]["datasetTitle"];
  const custodianFirstName = jsonObject[0]["general"]["custodian"]["firstName"];
  const custodianLastName = jsonObject[0]["general"]["custodian"]["lastName"];
  const custodianEmail = jsonObject[0]["general"]["custodian"]["email"];
  
  let mailBodyStr = `Dataset information:

Dataset Custodian: ${custodianFirstName + ' ' + custodianLastName}
Dataset Custodian Email: ${custodianEmail}
Dataset Title: ${dsTitle}
    
Attachments:
  
`;
  return mailBodyStr
}

function writeMailBodyConfirmation(jsonObject) {

  let contactPersonName = undefined;

  if (jsonObject[0]["general"]["contactperson"]["same"]) {
    contactPersonName = jsonObject[0]["general"]["custodian"]["firstName"];
  } else {
    contactPersonName = jsonObject[0]["general"]["contactperson"]["contactinfo"]["firstName"];
  }

  let mailBodyStr = `Dear ${contactPersonName},

Thank you for submitting metadata for the dataset "${jsonObject[0]["general"]["datasetinfo"]["datasetTitle"]}". We will review the metadata and get back to you as soon as possible.

The attached file(s) are the metadata you submitted. The json file contains the metadata in a machine-readable format and if you at some point need to make changes to the metadata, you can upload it to the wizard, make modifications and resubmit.

If you have any further questions, please contact the curation team at ${process.env.EMAIL_ADDRESS_CURATION_SUPPORT}.

Best regards,
EBRAINS Curation Service
curation-support@ebrains.eu

`;
return mailBodyStr
}

function prepareMailAttachments(requestObject) {

  let mailAttachmentArray = []; // Initialize an empty list for attachments

  let jsonAttachment = { // utf-8 string as an attachment
    filename: 'metadata.json',
    content: requestObject.body.jsonData
  };
  mailAttachmentArray.push(jsonAttachment)
  
  if (requestObject.body.excelData) { // push excel data to the attachment list if it is present
    console.log('excel_file', requestObject.body.excelData)

    let excelAttachment = {
      filename:'subject_data.xlsx',
      content: convertExcelDataUrlToByteArray(requestObject.body.excelData), 
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    };
    
    mailAttachmentArray.push(excelAttachment)

  } else {  
    // No excel file was provided, thats fine.
  }

  if (requestObject.files !== null) {
    if (requestObject.files.previewImage) { // push image file to the attachment list if it is present
      //console.log('preview image', requestObject.body.previewImage)
      //console.log('type of preview image', typeof requestObject.body.previewImage)
      console.log('image size', requestObject.files.previewImage.size / 1024 / 1024, 'MB')
      console.log(requestObject.files.previewImage)
      let previewImageAttachment = {
        filename: requestObject.files.previewImage.name,
        content: requestObject.files.previewImage.data,
        contentType: requestObject.files.previewImage.mimetype
      };
      mailAttachmentArray.push(previewImageAttachment)
    }
  } else {  
    // No preview image file was provided, thats fine.
  }


  return mailAttachmentArray
}

function convertExcelDataUrlToByteArray(excelString) {
  
  var byteString = atob(excelString.split(',')[1])

  // write the bytes of the string to an ArrayBuffer
  var ab = new ArrayBuffer(byteString.length);
  var dw = new DataView(ab);
  for(var i = 0; i < byteString.length; i++) {
    dw.setUint8(i, byteString.charCodeAt(i));
  }

  //convert bytestring from string to uint8array
  var uint8Array = new Uint8Array(ab);
  return uint8Array
}

function cleanTicketNumber(ticketNumber) {
  // Remove square brackets from ticket number
  let cleanedTicketNumber = ticketNumber.replace('[', '');
  cleanedTicketNumber = cleanedTicketNumber.replace(']', '');

  // Remove ticket from ticket number
  cleanedTicketNumber = cleanedTicketNumber.replace('Ticket', '');

  // Remove whitespace from ticket number
  cleanedTicketNumber = cleanedTicketNumber.replace(' ', '');
  
  // Remove number symbol from ticket number
  cleanedTicketNumber = cleanedTicketNumber.replace('#', '');

  return cleanedTicketNumber
}



