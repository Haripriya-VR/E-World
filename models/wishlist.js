const mongoose = require( 'mongoose' )

const Schema = mongoose.Schema

const wishlistSchema = Schema({
    
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        required : true
    },

    products :[{
        type : mongoose.Schema.Types.ObjectId,
        ref : 'product',
        required : true
    }]
})


wishlist = mongoose.model( 'wishlist', wishlistSchema,'wishlist' )
module.exports = wishlist;
