const mongoose = require('mongoose');

require("../config/dbconnect");
  
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
    },
    wallet : {
        type : Number,
        default : 0
    },

    walletHistory : [{
        date : {
            type : Date,
        },
        amount : {
            type : Number
        },
        message : {
            type : String
        }

    }]
  });
  
  // Create a Mongoose model for the "users" collection
  const User = mongoose.model('User', userSchema);
  
  // Export the User model
  module.exports = User;