const mongoose = require('mongoose');

require("../config/dbconnect");

// Define the schema for the "users" collection

// const addressSchema = mongoose.Schema({
//     addressLane: { type: String },
//     country: { type: String },
//     pincode: { type: Number },
//     state: { type: String },
//   });



  
  const userSchema =  mongoose.Schema({
    userName: {
      type: String,
      required:true 
    }, 
    phone_number: {
       type: Number,
    },
    email: {
       type: String,
        unique: true 
    },
    password: {
       type: String,
      required:true 
    },
    verified:{
      type:Boolean
    },
    timeStamp:{
      type:Date
    },
    address : [{
      type : mongoose.Schema.Types.ObjectId,
      ref : 'address'
  }],
    ISactive: {
       type: Boolean,
        default: false 
    }, 
    ISbanned: { 
      type: Boolean,
       default: false
    }
  });
  
  // Create a Mongoose model for the "users" collection
  const User = mongoose.model('User', userSchema);
  
  // Export the User model
  module.exports = User;