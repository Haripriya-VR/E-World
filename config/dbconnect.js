const mongoose = require("mongoose");
require('dotenv').config();
const databaseURL = process.env.DATABASE_URL
console.log(databaseURL);
mongoose.connect("mongodb+srv://hpvr80343:1234@e-world.tgp2bd1.mongodb.net/?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true, 
})
    .then((res) => {
        console.log('connected');
    })
    .catch((err) => {
        console.log('error occured during establishing the connection', err);
    })

module.exports = mongoose;

// const mongoose = require("mongoose");

// mongoose.connect('mongodb://0.0.0.0:27017/E-world',) 
// .then((res)=>{
    
// }) 
// .catch((err)=>{
//     console.log('error occured during establishing the connection',err);
// })

// module.exports = mongoose; 