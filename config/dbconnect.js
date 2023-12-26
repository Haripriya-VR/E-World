const mongoose = require("mongoose");

mongoose.connect('mongodb://0.0.0.0:27017/E-world',)
.then((res)=>{
    
}) 
.catch((err)=>{
    console.log('error occured during establishing the connection',err);
})

module.exports = mongoose;