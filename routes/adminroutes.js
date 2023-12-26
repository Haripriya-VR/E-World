const express = require('express')
const multer=require("multer")
const adminControl =require('../controller/adminController')
const productControl = require('../controller/productController')
const categoryControl = require('../controller/categoryController')
const orderControl = require('../controller/orderController')
const adminAuth=require("../middlewares/AdminAuth")
const UserAuth=require("../middlewares/UserAuth")

const admin = express.Router();
const upload = require('../middlewares/uploads')


admin.get("/adminlogin", adminControl.admin_log);
admin.post("/adminlogin",adminControl.admin_validation);


// admin dashboard
admin.get("/dashboard",adminControl.admin_dash);
admin.post('/dashboard/download-sales-report',adminControl.admin_dash)
// admin.get('/dashboard',adminControl.salesReport)


// products management
admin.get('/products',productControl.products_page)
admin.get('/addproducts',productControl.addproducts_get)
admin.post('/addproducts', upload.array('productImages', 3), productControl.products_post);
admin.get('/edit-products/:id',productControl.editproduct)
admin.post('/edit-products/:id',upload.array('productImages', 3),productControl.editproduct_post)
admin.post('/products/search',productControl.search_products)
// Add routes to activate and deactivate products
admin.get('/product-activate/:id', productControl.activateProduct);
admin.get('/product-deactivate/:id', productControl.deactivateProduct);




// user management
admin.get('/customers',adminControl.customers)
admin.get("/customers/block/:id",adminControl.customerBlock)
admin.get("/customers/unblock/:id",adminControl.customerUnblock)
admin.post("/customers/search", adminControl.customerSearch);




// category management
admin.get('/category',categoryControl.category_get)
admin.get('/addcategory',categoryControl.add_category)
admin.post('/addcategory',categoryControl.category_post)
admin.post('/category/search', categoryControl.search_category);
admin.get('/edit-category/:id',categoryControl.get_editcategory)
admin.post('/edit-category/:id',categoryControl.edit_category)
admin.get('/category-activate/:id', categoryControl.activateCategory);
admin.get('/category-deactivate/:id', categoryControl.deactivateCategory);


// order management
admin.get('/orders',orderControl.order_get)
admin.get('/order-details/:id',orderControl.order_details)
admin.post('/update-order-status/:id',orderControl.update_status)





module.exports=admin;