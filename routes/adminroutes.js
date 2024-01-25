const express = require('express')
const multer=require("multer")
const adminControl =require('../controller/adminController')
const productControl = require('../controller/productController')
const categoryControl = require('../controller/categoryController')
const orderControl = require('../controller/orderController')
const couponControl = require('../controller/couponController')
const adminAuth=require("../middlewares/AdminAuth")


const admin = express.Router();
const upload = require('../middlewares/uploads')


admin.get("/adminlogin", adminControl.admin_log);
admin.post("/adminlogin",adminControl.admin_validation);
// admin logout
admin.get("/logout",adminControl.logout)

// admin dashboard
admin.get("/dashboard",adminAuth.verifyAdmin,adminControl.admin_dash);





// products management 
admin.get('/products',adminAuth.verifyAdmin,productControl.products_page)
admin.get('/addproducts',adminAuth.verifyAdmin,productControl.addproducts_get)
admin.post('/addproducts', upload.array('productImages', 3), productControl.products_post);
admin.get('/edit-products/:id',adminAuth.verifyAdmin,productControl.editproduct)
admin.post('/edit-products/:id',upload.array('productImages', 3),productControl.editproduct_post)
admin.post('/products/search',productControl.search_products)
// Add routes to activate and deactivate products
admin.get('/product-activate/:id', productControl.activateProduct);
admin.get('/product-deactivate/:id', productControl.deactivateProduct);


// user management
admin.get('/customers',adminAuth.verifyAdmin,adminControl.customers)
admin.get("/customers/block/:id",adminControl.customerBlock)
admin.get("/customers/unblock/:id",adminControl.customerUnblock)
admin.post("/customers/search", adminControl.customerSearch);


// category management
admin.get('/category',adminAuth.verifyAdmin,categoryControl.category_get)
admin.get('/addcategory',adminAuth.verifyAdmin,categoryControl.add_category)
admin.post('/addcategory',categoryControl.category_post)
admin.post('/categorycheck',categoryControl.category_check)
admin.post('/category/search', categoryControl.search_category);
admin.get('/edit-category/:id',adminAuth.verifyAdmin,categoryControl.get_editcategory)
admin.post('/edit-category/:id',categoryControl.edit_category)
admin.get('/category-activate/:id', categoryControl.activateCategory);
admin.get('/category-deactivate/:id', categoryControl.deactivateCategory);


// order management
admin.get('/orders',adminAuth.verifyAdmin,orderControl.order_get)
admin.get('/order-details/:id',adminAuth.verifyAdmin,orderControl.order_details)
admin.post('/update-order-status/:id',orderControl.update_status)


// coupon management
admin.get('/coupon',adminAuth.verifyAdmin,couponControl.getCoupon)
admin.get('/addCoupons',adminAuth.verifyAdmin,couponControl.add_coupon)
admin.post('/addCoupons',couponControl.post_addcoupon)
admin.get('/editCoupon/:id',adminAuth.verifyAdmin,couponControl.get_editcoupon)
admin.post('/editCoupons/:id',couponControl.post_editcoupon)
admin.post('/coupon/search',couponControl.searchCoupon)

admin.post('/couponcheck',couponControl.couponCheck)


// sales Report 

admin.get('/salesReport',adminAuth.verifyAdmin,adminControl.salesReport)
admin.post('/salesReport/download-sales-report',adminControl.salesReport)

module.exports=admin;