const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config();

const { AUTH_EMAIL, AUTH_PASS } = process.env;

const mailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Set to false for port 587
    requireTLS: true,
    auth: {
        user: AUTH_EMAIL,
        pass: AUTH_PASS,
    },
});

mailTransporter.verify((error, success) => {
    if (error) {
        console.log('Error: is this', error);
    } else {
        console.log('Email ready');
        console.log(success);
    }
});

const sendEmail = async (mailOptions) => {
    try {
        await mailTransporter.sendMail(mailOptions);
        console.log('Email sent');
        return;
    } catch (err) {
        console.log('Error in sending email:', err);
    }
};

module.exports = {
    sendEmail,
};
