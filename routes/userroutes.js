const express=require("express");
const path = require('path');
const userControl =require('../controller/userController')
const otpControl = require('../controller/otpController')
const cartControl = require('../controller/cartController')
const checkoutControl = require('../controller/checkoutController')
const orderControl = require('../controller/orderController')
const profileControl = require('../controller/profileController')
const wishlistControl = require('../controller/wishlistController')
const couponControl = require('../controller/couponController')
const otp = require('../models/otpverification')
const UserAuth=require("../middlewares/UserAuth")
const users = express.Router()

users.get('/',UserAuth.userverify,userControl.checkUserBlocked,userControl.home_get)

// sign up
users.get('/signup',userControl.usersignup)
users.post('/signup',userControl.usersignup_post)
users.get("/users/otp-senting",otpControl.otpSender) 
users.get('/users/otpverify',otpControl.otp_get)  
users.post('/users/otpverify',otpControl.otp_verify)

// login routes
users.get('/login',UserAuth.userverify,userControl.userlogin)
users.post('/loginpost',userControl.login_post)
users.get('/logout',userControl.logout)

// profile page
users.get('/profile',userControl.checkUserBlocked,profileControl.user_profile)
users.get('/profile-addAddress',profileControl.profile_addAddress_get)
users.post('/profile-addAddress',profileControl.profile_addAddress_post)
users.get('/profile-editAddress/:id',profileControl.profile_editAddress_get)
users.post('/profile-editAddress/:id',profileControl.profile_editAddress_post)
users.get('/delete-address/:id',profileControl.delete_address)
users.get('/profile/profile-orders',profileControl.profile_orders)
users.get('/profile-orderedproducts/:id',profileControl.ordered_products)
// users.get('/cancel-orderedproduct/:orderId/:productId', profileControl.cancel_orderedproducts);
users.patch('/profile-orders/cancel-order',profileControl.cancel_order)
users.patch('/profile-orders/return-order',profileControl.returnOrder)
users.get('/edit-bio',profileControl.editbio_get)
users.post('/edit-bio',profileControl.edit_bio)
// invoice
users.get('/invoice/:id',profileControl.invoice)
users.get('/wallet',profileControl.wallet)

// product page get 
users.get('/products',userControl.checkUserBlocked,userControl.product_get)
users.post('/products/search',userControl.searchProducts)
users.get('/selectCategory',userControl.category_get)
users.get('/filterAcenting',userControl.filterAcenting)
users.get('/filterDecenting',userControl.filterDecenting)


// single product details get
users.get('/product-details/:productId',userControl.checkUserBlocked,userControl.single_product);


// cart management
users.get('/cart',userControl.checkUserBlocked,cartControl.cart_get);
users.post('/addtocart/:id',cartControl.addtocart);
users.post('/updatequantity',cartControl.updateQuantity);
users.get('/delete-cart/:id',cartControl.delete_cart);

users.post('/applyCoupon',couponControl.applycoupon)


// wishlist
users.get('/wishlist',userControl.checkUserBlocked,wishlistControl.wishlist_get);
users.post('/addtowishlist/:id',wishlistControl.addtowishlist);
users.get('/removeproducts/:id',wishlistControl.removeProducts)

// checkout page get
users.get('/checkout',userControl.checkUserBlocked,checkoutControl.checkout_get);
users.get('/checkout-addAddress',checkoutControl.addAddress_get);
users.post('/checkout-addAddress',checkoutControl.addAddress_post);


// place order
users.post('/place-order',userControl.checkUserBlocked,orderControl.placeorder_post);
users.get('/order-confirmed',userControl.checkUserBlocked,orderControl.orderconfirm_get);

users.post('/verify-payment',userControl.checkUserBlocked,orderControl.verifyPayment);

module.exports = users;
