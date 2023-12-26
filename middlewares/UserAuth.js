

const userverify = (req,res,next)=>{
  if(req.session.email ){
    next()
  }else{
    res.render('users/login')
  }
}


  module.exports = { 
    userverify,
   
  }