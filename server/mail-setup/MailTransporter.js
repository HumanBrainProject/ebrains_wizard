// This script creates a transport object which can be used to send emails

//  This script requires the following environment variables to be set:
//  - DEPLOYMENT_LOCATION : The location where the app is deployed, either local, CSCS or JSC
//  - EMAIL_HOSTNAME : The hostname of the smtp server, e.g. smtp.gmail.com, a relay server or an ip address.
//  - EMAIL_ADDRESS_SENDER : The email address of the sender
//  - EMAIL_PASSWORD : The password of the sender email address (optional, depending on the smtp server configuration)


const nodemailer = require('nodemailer'); // Nodemailer is used for sending emails

// Email configuration for testing via local development:
if (process.env.DEPLOYMENT_LOCATION==='local') {
    var transportConfiguration = {
      host: process.env.EMAIL_HOSTNAME,
      auth: {
        user: process.env.EMAIL_ADDRESS_SENDER,
        pass: process.env.EMAIL_PASSWORD
      }
  }

} // Configuration for open shift on CSCS
else if (process.env.DEPLOYMENT_LOCATION==='CSCS') { 
  var transportConfiguration = {
    host: process.env.EMAIL_HOSTNAME,
    port: 25,
    secure: false, // Don't use TLS (default is false, but make it explicit)
    tls: {rejectUnauthorized: false}
  };

// Configuration for kubernetes on JSC
} else if (process.env.DEPLOYMENT_LOCATION==='JSC') {
  var transportConfiguration = {
    host: process.env.EMAIL_HOSTNAME,
    port: 587,
    auth: {
      user: process.env.EMAIL_ADDRESS_SENDER,
      pass: process.env.EMAIL_PASSWORD
    },
    tls: {
      rejectUnauthorized: false
    },
    logger: true,
    debug: true
  }

} else {
  console.log('No mail configuration found for deployment location ' + process.env.DEPLOYMENT_LOCATION);
  console.log('Please set the environment variable DEPLOYMENT_LOCATION to either local, CSCS or JSC');
  var transportConfiguration = {}
}

var mailTransporter = nodemailer.createTransport(transportConfiguration)

mailTransporter.verify((error, success) => {
  if (error) {
    console.log('Failed to create a mail transporter');
    console.log(error);
  } else {
    console.log('Successfully created a mail transporter');
  }
});

module.exports = mailTransporter;
