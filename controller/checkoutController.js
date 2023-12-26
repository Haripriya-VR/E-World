const User = require('../models/users')
const Cart = require('../models/cart');
const Address = require('../models/Address')

const checkout_get = async(req,res)=>{
try {
    const login = req.session.login;
    const userId = await User.findOne({ email: req.session.email }).select('_id');
    const cart = await Cart.findOne({ userId: userId }).populate('items.productId')
    const products = cart.items
    const cartQuantity = cart ? cart.items.length : 0;
    const cartTotal = cart.items.reduce((total, current) => total + current.quantity * current.productId.price, 0);
    const users = await User.findOne({ _id : userId }).populate('address')
    const Address = users.address

    res.render('users/checkout',{login,products,cart,Address,cartQuantity,cartTotal})
} catch (error) {
    
}
}



const addAddress_get = async(req,res)=>{
    const login = req.session.login;
    const userId = await User.findOne({ email: req.session.email }).select('_id');
    const cart = await Cart.findOne({ userId: userId }).populate('items.productId')
    const cartQuantity = cart ? cart.items.length : 0;

    res.render('users/checkout-addAddress',{login,cartQuantity})
}


const addAddress_post = async(req,res)=>{
try {
    const login = req.session.login
    const userId = await User.findOne({ email: req.session.email }).select('_id');
    const address =new Address({
        fullName:req.body.username,
        mobile:req.body.phone_number,
        street:req.body.street_name,
        village:req.body.village,
        city:req.body.city,
        pinCode:req.body.pincode,
        landmark:req.body.landmark,
        district:req.body.district,
        state:req.body.state,
        userId : userId
    })
    const savedAddress = await address.save();

    await User.updateOne(
      { _id: userId },
      {
        $push: { address: savedAddress._id },
      }
    );
   res.redirect( '/checkout' )
} catch (error) {
    console.log('error in checkout address post',error);
}
}

module.exports = {
    checkout_get,
    addAddress_get,
    addAddress_post,
}