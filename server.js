const express = require('express');
var flash = require('connect-flash');
const path = require('path');

const session = require('express-session');
const nocache = require('nocache');
const {v4: uuidv4 }= require("uuid");
const users = require("./routes/userroutes");
const admin = require("./routes/adminroutes");
const db = require('./config/dbconnect');

const errorControl = require('./controller/errorController')

const env = require('dotenv');
env.config();
const app = express()

// static 
app.use("/static",express.static(path.join(__dirname,"public")))
app.use('/uploads', express.static('uploads'));


const PORT=process.env.PORT || 3002


// view engine
app.set('view engine','ejs');

//request parse
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// nocache
app.use(nocache());


//session setup
app.use(
  session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: false,
  })
);


app.use(flash());


app.use('/',users)
app.use('/admin',admin)


app.use('/500',errorControl.get500)
app.use(errorControl.get404)


// Server Runnning
app.listen(PORT,()=>{
    console.log(`server running on : http://localhost:${PORT}`);
})
