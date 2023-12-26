const mongoose = require('mongoose');
require("../config/dbconnect");

const OTPverificationSchema = mongoose.Schema({
    userID :String,
    email : String,
    otp:String,
    createdAt:Date,
    expireAt: { type: Date, expires: 0, default: null },
})

OTPverificationSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const OTPverification = mongoose.model("otpverification",OTPverificationSchema,);

module.exports = OTPverification;