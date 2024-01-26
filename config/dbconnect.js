const mongoose = require("mongoose");
require('dotenv').config();
const databaseURL = process.env.DATABASE_URL

mongoose.connect(databaseURL)
.then((res)=>{
    console.log('connected'); 
}) 
.catch((err)=>{
    console.log('error occured during establishing the connection',err);
})

module.exports = mongoose;

