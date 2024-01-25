const OTPverification = require("../models/otpverification");
const userControl = require('../controller/userController')
const user = require("../models/users")
const nodemailer = require('nodemailer')
const bcrypt = require("bcrypt");
const otp = require('../utils/otp-generator')
const { sendEmail } = require('../utils/sending otp')

const { AUTH_EMAIL } = process.env;

// senting the otp  to email
const sent_otp = async (email) => {
    try { 
        if (!(email)) {
            throw Error("provide values for email,subject,message")
        }
        //generate new otp
        const generatedOTP = otp();

        //sending email to the user
        const mailOptions = {
            from: AUTH_EMAIL,
            to: email,
            subject: "Verify the email using this otp",
            html: `<p>Hello new user use the this otp to verify your email to continue </p><p style="color:tomato;font-size:25px;letter-spacing:2px;">
            <b>${generatedOTP}</b></p><p>OTP will expire in<b> 10 minute(s)</b>.</p>`
        }
        await sendEmail(mailOptions);

        // save the otp record

        const hashedData = await bcrypt.hash(generatedOTP, 10);
        const currentDate = new Date();

        const newDate = new Date(currentDate.getTime() + 2 * 60 * 1000);

        const newOTP = await new OTPverification({
            email,
            otp: hashedData,
            createdAt: Date.now(),
            expireAt: newDate,
        })
        const createdOTPrecord = await newOTP.save()
        return createdOTPrecord;


    } catch (error) {
        res.render('./error/500')
    }
}

// get otp verificaton page

const otp_get = async (req, res) => {
try {
    if(req.session.email){
        res.redirect('/users/userhome')
    }else{
        res.render('./users/otpverify')
    }
} catch (error) {
    res.render('./error/500')
}
}

// verfiying the otp received post

const otp_verify = async (req, res) => {
    if (req.session.signotp) {
        try {
            const data = req.session.data;
            const dataplus = {
                userName: data.userName,
                phone_number: data.phone_number,
                email: data.email,
                password: data.password,
                ISactive: true,
                timeStamp: Date.now()
            }

            const Otp = await OTPverification.findOne({ email: data.email })

            const hashed = Otp.otp; 

            // Use the plain text user OTP
            const otp_fromuser = req.body.code;

            const match = await bcrypt.compare(otp_fromuser, hashed);
            if (!match || '') {
                // If OTP does not match, set an error message
                const errorMessage = 'Invalid OTP. Please try again.';
                res.json({errorMessage})
            }

            if (match) {
                const result = await user.insertMany([dataplus])
                req.session.signotp = false

                req.session.logged = true
                res.json({success:true})
               

            }
            else {
                const errorMessage = 'otp doesnot match try again'
                res.json({errorMessage})
            }

        } catch (err) {
            res.render('./error/500')
           
        }
    }

}


const otpSender = async (req, res) => {
    try {
        const email = req.session.data.email;
        const createdOTP = await sent_otp(email)
        res.status(200).redirect("/users/otpverify")
    } catch (error) {
        res.redirect('/users/signup')
    }
}

module.exports = {
    otp_get,
    sent_otp,
    otpSender,
    otp_verify,
}