

const mongoose = require('mongoose');

const {Schema,ObjectId} = mongoose

const categorySchema = new Schema({
    category: {
        type: String,
        required: true
    },
    status : {
        type : Boolean,
        default : true
    },
     timeStamp: { 
        type: Date 
    },
});

const category = mongoose.model('category', categorySchema, 'category');

module.exports = category;
