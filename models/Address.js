const mongoose = require('mongoose')

const Schema = mongoose.Schema

const addressSchema = Schema({

    fullName: {
        type : String,
        required : true
    },

    mobile : {
        type : Number,
        required : true
    },

    street : {
        type : String,
        required : true
    },

    village : {
        type : String,
        required : true
    },

    city : {
        type : String,
        required : true
    },
    
    pinCode:{
        type:Number,
        required:true,
    },

    landmark :{
        type : String,
        required : true
    },

    district : {
        type : String,
        required : true
    },

    state : {
        type : String,
        requred : true
    },

    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    }

})
const address = mongoose.model( 'address', addressSchema ,'address');

module.exports = address ;
