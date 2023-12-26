const products = require('../models/products');
const User = require('../models/users')
const Cart = require('../models/cart');


const wishlist_get= async(req,res)=>{
    try {
        const login = req.session.login;
        const userId = await User.findOne({ email: req.session.email }).select('_id');
        const cart = await Cart.findOne({ userId: userId }).populate('items.productId')
        const cartQuantity = cart ? cart.items.length : 0;

        res.render('users/wishlist',{login,cartQuantity});
    } catch (error) {
        console.log('error in wishlist_get',error);
    }
  }


  module.exports ={
    wishlist_get,
  }