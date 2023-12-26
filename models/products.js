const mongoose = require( 'mongoose' )

const { Schema, ObjectId } = mongoose;

const productSchema = Schema({
    name : {
        type : String,
        required : true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category', 
        required: true
    },
    quantity : {
        type : String,
        required : true
    },

    price : {
        type : Number,
        required : true
    },

    images: {type: Array,
    required:true},
    
    description : {
        type : String,
        required : true
    },
    status : {
        type : Boolean,
        default : true
    },
    timeStamp: { 
        type: Date 
    },
    
})

const products = mongoose.model('product', productSchema,'product')

module.exports =  products;  

