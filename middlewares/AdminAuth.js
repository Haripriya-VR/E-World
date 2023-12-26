const verifyAdmin = (req,res,next)=>{
    if (req.session.admin) {
        next()
    } else {
        res.redirect('./admin/admin-login')
    }
}

const adminExist=(req,res,next)=>{
    if(req.session.admin){
        res.redirect('/admin/dashboard')
    }else{
     next()
    }
}

module.exports={
    verifyAdmin,
    adminExist
    
 }