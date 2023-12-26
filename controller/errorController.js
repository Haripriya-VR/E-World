const get500 = (req,res)=>{
    res.render('error/500')
}
const get404 = (req,res)=>{
    res.render('error/404')
  }

module.exports = {
    get404,
    get500
}