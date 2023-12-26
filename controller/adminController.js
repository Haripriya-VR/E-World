const User = require('../models/users')
const category = require('../models/category');
const products = require('../models/products')
const order = require('../models/order');
const dashboardHelper = require( '../helpers/dashboardHelper' )


const credentials = {
  email: 'e-world123@gmail.com',
  password: "1234"
}


//Admin login
const admin_log = (req, res) => {
 try {
  res.render("admin/adminlog", { title: "Adminlogin", errmsg: req.flash("errmsg") })
 } catch (error) {
  console.log('error in admin_log',error);
 }
}


const admin_validation = (req, res) => {
  try {
    const { email, password } = req.body;

    if (credentials.email === email && credentials.password == password) {
      req.session.admin = true;
      res.redirect("/admin/dashboard");

    } else if (credentials.email !== email) {
      console.log('credential invalid');
      req.flash("errmsg", "Wrong Email!");
    } else if (credentials.password !== password) {
      console.log('password invalid');
      req.flash("errmsg", "Wrong Password!");
    } else {
      req.flash("errmsg", "Wrong credentials!");
    }

    console.log('Flash Messages:', req.flash('errmsg'));

    res.render("admin/adminlog", { errmsg: req.flash('errmsg') });

  } catch (e) {
    console.log("error in admin validation",e);
    req.flash("errmsg", "Wrong credential!");
    res.redirect("/admin/adminlog");
  }
};


// ADMIN DASHBOARD
const admin_dash = async (req, res) => {
try {
  
  if (req.session.admin) {

    const {startDate,endDate} = req.body;

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5

    const totalOrders = await order.countDocuments({orderStatus:"delivered"})
    const totalPages = Math.ceil(totalOrders / limit)

    let query = { orderStatus: "delivered" };

    if (startDate && endDate) {
      query.date = {
        $gte: startDate,
        $lt: endDate
      };
    }
    
    const sales = await order.find(query).sort({ date: 1 }).skip((page - 1) * limit).limit(limit);
    
    // const sales = await order.find({orderStatus:"delivered"}).sort({ date: 1 }).skip((page - 1) * limit).limit(limit);

   
    // const salesReport = await order.find({
    //   date: {
    //     $gte: startDate,
    //     $lt: endDate
    //   }
    // });
    //console.log('sales Reprot here',salesReport);

    const productCount = await products.countDocuments();
    const customerCount = await User.countDocuments();
    const ordersPlaced = await order.find({
      orderStatus: { $in: ['pending', 'shipping'] }
    }).countDocuments();

    const totalRevenue = await order.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$totalprice" }
        }
      }
    ]);

    const totalRevenueValue = totalRevenue.length > 0 ? totalRevenue[0].totalRevenue : 0;
    // products graph details
    const mostSoldProduct = await dashboardHelper.mostSoldProducts()
    // sales graph details
    const dailyChart = await dashboardHelper.dailyChart();
  
    const monthlyChart = await dashboardHelper.monthlyChart();
    
    const yearlyChart = await dashboardHelper.yearlyChart();
    

    res.render("admin/dashboard", {
      productCount,
      customerCount,
      ordersPlaced,
      totalRevenue: totalRevenueValue,
      mostSoldProduct,
      dailyChart,
      monthlyChart,
      yearlyChart,
      sales,
      // salesReport,
      page,
      totalPages,
      limit
    });
  }
} catch (error) {
  console.log('Error in dashboard',error);
} 
};





// Admin user page
const customers = async (req, res) => {
 try {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 8;

  const totalCustomers = await User.countDocuments();

  const totalPages = Math.ceil(totalCustomers / limit);

  const customer = await User.find().skip((page - 1) * limit).limit(limit);
  res.render('admin/customers', { customer,page,totalPages,limit });
 } catch (error) {
  console.log('error in customers',error);
 }
};

// Admin user block 
const customerBlock = async (req, res) => {
  try {
    const id = req.params.id;
    await User.updateOne({ _id: id }, { $set: { "ISbanned": true } });
    res.redirect("/admin/customers");
    console.log("blocked");

  } catch (err) {
    console.log('block error', err);
  }
}


// Admin user unblock
const customerUnblock = async (req, res) => {
  try {
    const id = req.params.id;
    await User.updateOne({ _id: id }, { $set: { "ISbanned": false } });
    console.log("unblocked");
    res.redirect("/admin/customers");

  } catch (err) {
    throw err;
  }
}


// customer search
const customerSearch = async (req, res) => {
  try {
    const search_customer = req.body.search
    const customer = await User.find({ userName: search_customer })
    res.render("admin/customers", { customer })
  } catch (error) {

  }
}

// LOGOUT
// const logout = (req, res) => {
//   req.session.destroy((err) => {
//     if (err) {
//       console.log(err);
//       res.send('Error');
//     }
//   })

//   res.redirect("/admin/adminlogin")
// }


module.exports = {
  admin_log,
  admin_validation,
  admin_dash,
  customers,
  customerBlock,
  customerUnblock,
  customerSearch,
  // logout,
}