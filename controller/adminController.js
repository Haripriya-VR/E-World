const User = require('../models/users')
const category = require('../models/category');
const products = require('../models/products')
const order = require('../models/order');
const dashboardHelper = require('../helpers/dashboardHelper')


const credentials = {
  email: process.env.ADMIN_EMAIL,
  password: process.env.ADMIN_PASS
}


//Admin login
const admin_log = (req, res) => {
  try {
    if (req.session.admin) {
      res.redirect('/admin/dashboard')
    } else {
      res.render("admin/adminlog", { title: "Adminlogin", errmsg: req.flash("errmsg") })
    }
  } catch (error) {
    res.render('./error/500')
  }
}


const admin_validation = (req, res) => {
  try {
    const { email, password } = req.body;

    if (credentials.email === email && credentials.password == password) {
      req.session.admin = email;
      res.json({success:true})
      // return res.redirect("/admin/dashboard");

    } else if (credentials.email !== email ||credentials.password !== password) {
      const message = '"invalid email or password"'
      req.json({message});
    }

  } catch (e) {
    res.render('./error/500')
  }
};


// ADMIN DASHBOARD
const admin_dash = async (req, res) => {
  try {

    if (req.session.admin) {

      const { startDate, endDate } = req.body;

      const page = parseInt(req.query.page) || 1
      const limit = parseInt(req.query.limit) || 5

      const totalOrders = await order.countDocuments({ orderStatus: "delivered" })
      const totalPages = Math.ceil(totalOrders / limit)

      let query = { orderStatus: "delivered" };

      if (startDate && endDate) {
        query.date = {
          $gte: startDate,
          $lt: endDate
        };
      }

      const sales = await order.find(query).sort({ date: 1 }).skip((page - 1) * limit).limit(limit);

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
    res.render('./error/500')
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
    res.render('admin/customers', { customer, page, totalPages, limit });
  } catch (error) {
    res.render('./error/500')
  }
};

// Admin user block 
const customerBlock = async (req, res) => {
  try {
    const id = req.params.id;
    await User.updateOne({ _id: id }, { $set: { "ISbanned": true } });
    res.redirect("/admin/customers");

  } catch (err) {
    res.render('./error/500')
  }
}


// Admin user unblock
const customerUnblock = async (req, res) => {
  try {
    const id = req.params.id;
    await User.updateOne({ _id: id }, { $set: { "ISbanned": false } });
    res.redirect("/admin/customers");

  } catch (err) {
    res.render('./error/500')
  }
}


// customer search
const customerSearch = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const totalCustomers = await User.countDocuments();

    const totalPages = Math.ceil(totalCustomers / limit);

    const search_customer = req.body.search
    const customer = await User.find({ userName: search_customer })
    res.render("admin/customers", { customer, page, totalPages, limit })
  } catch (error) {

  }
}
// Generate sales Report

const salesReport = async (req, res) => {
  try {

    const { startDate, endDate } = req.body;

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5

    const totalOrders = await order.countDocuments({ orderStatus: "delivered" })
    const totalPages = Math.ceil(totalOrders / limit)
    const grandTotal=0
    let query = { orderStatus: "delivered" };

    if (startDate && endDate) {
      if (startDate === endDate) {
        const startDateObject = new Date(startDate);
        const endDateObject = new Date(startDateObject);
        endDateObject.setDate(startDateObject.getDate() + 1); // Set to the next day
        query.date = {
          $gte: startDateObject,
          $lt: endDateObject
        };
      } else {
        query.date = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }
    }

    const sales = await order.find(query).sort({ date: 1 }).skip((page - 1) * limit).limit(limit);

    res.render('admin/salesReport', {
      sales,
      grandTotal,
      page,
      totalPages,
      limit
    })
  } catch (error) {
    res.render('./error/500')
  }
}

// LOGOUT
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.render('./error/500')
    }
  })

  res.redirect("/admin/adminlogin")
}


module.exports = {
  admin_log,
  admin_validation,
  admin_dash,
  customers,
  customerBlock,
  customerUnblock,
  customerSearch,
  salesReport,
  logout,
}