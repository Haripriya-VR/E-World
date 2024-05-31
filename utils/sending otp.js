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

// const mailTransporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         user: AUTH_EMAIL,
//         pass: AUTH_PASS
//     }
// });

// mailTransporter.verify((error, success) => {
//     if (error) {
//         res.render('./error/500')
//     }else{

//     }
// });

const sendEmail = async (mailOptions,res) => {
    try {
        await mailTransporter.sendMail(mailOptions);
        return;
    } catch (err) {
        res.render('./error/500')
    }
};

module.exports = {
    sendEmail,
};
