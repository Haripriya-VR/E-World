const coupon = require('../models/coupon');
const User = require('../models/users')
const cart = require('../models/cart')
const couponHelper = require('../helpers/couponHelper')


// get coupon
const getCoupon = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const page = parseInt(req.query.page) || 1;

    const totalCoupon = await coupon.countDocuments();
    const totalPages = Math.ceil(totalCoupon / limit);

    const Coupon = await coupon.find()

    res.render('admin/coupon', { limit, page, totalCoupon, totalPages, Coupon })
  } catch (error) {
    res.render('./error/500')
  }
}

// get add coupon
const add_coupon = (req, res) => {
  try {
    res.render('admin/addCoupons')
  } catch (error) {
    res.render('./error/500')
  }
}

// post add coupon
const post_addcoupon = async (req, res) => {
  try {

    const exist = await coupon.findOne({ name: req.body.couponname })

    if (exist) {
      return res.redirect('admin/addCoupons')
    }
    const data = {
      name: req.body.couponname,
      description: req.body.description,
      startingDate: req.body.StartingDate,
      expiryDate: req.body.expiringDate,
      minimumAmount: req.body.minimumAmount,
      discount: req.body.discount,
      discountType: req.body.discountType
    }

    const newCoupon = new coupon(data);

    await newCoupon.save();
    res.redirect('/admin/coupon')
  } catch (error) {
    res.render('./error/500')
  }
}


// check coupon

const couponCheck = async (req, res) => {
  try {
    const { couponname } = req.body
    const existingCoupon = await coupon.findOne({ name: couponname });
    const message = 'coupon already exists'
    if (existingCoupon) {
      return res.json({ success: true, message })
    }
  } catch (error) {

  }
}


// get edit coupon 
const get_editcoupon = async (req, res) => {
  try {
    const id = req.params.id
    const coupons = await coupon.findOne({ _id: id })

    res.render('admin/editCoupon', { coupons })

  } catch (error) {
    res.render('./error/500')
  }
}




// post edit coupon 
const post_editcoupon = async (req, res) => {
  try {
    const id = req.params.id


    const editedData = {
      name: req.body.couponname,
      description: req.body.description,
      startingDate: req.body.StartingDate,
      expiryDate: req.body.expiringDate,
      minimumAmount: req.body.minimumAmount,
      discount: req.body.discount,
      discountType: req.body.discountType,
      status: req.body.status

    }
    await coupon.updateOne({ _id: id }, { $set: editedData })

    res.redirect('/admin/coupon')

  } catch (error) {
    res.render('./error/500')
  }
}
// search coupons
const searchCoupon = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const page = parseInt(req.query.page) || 1;

    const totalProducts = await coupon.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    const search = req.body.search
    const Coupon = await coupon.find({ name: search })
    if (Coupon) {
      res.render('admin/coupon', { Coupon, page, totalPages, totalProducts })
    }
  } catch (error) {
    res.render('./error/500')
  }
}

const applycoupon = async (req, res) => {
  try {
    const { couponCode, subTotal } = req.body;

    const user = req.session.email;
    const userId = await User.findOne({ email: user }).select('_id');

    const Coupon = await coupon.find({ name: couponCode, status: true });
    if (Coupon.length <= 0) {
      return res.json({ success: false, message: 'Coupon doesnot exists' })
    }
    const usedCoupn = await coupon.findOne({name: couponCode, users: userId })
    if (usedCoupn) {
      return res.json({ success: false, message: 'Coupon already used' })
    }

    // If coupon exists
    if (Coupon && Coupon.length > 0) {
      const now = new Date();

      // if coupon not expired
      if (Coupon[0].expiryDate >= now && Coupon[0].startingDate <= now) {

        // Checking minimum Amount
        if (subTotal < Coupon[0].minimumAmount) {
          return res.json({ success: false, message: 'Minimum amount not reached' });
        } else {
          // Success
          const couponId = Coupon[0]._id; // Access _id property

          let discounted;
          discounted = await couponHelper.discountPrice(couponId, subTotal);


          res.json({ success: true ,discounted});

        
        }

      } else {
        res.json({ success: false, message: 'Invalid Coupon, outdated' });
      }
    } else {
      res.json({ success: false, message: 'Invalid Coupon' });
    }
  } catch (error) {
    res.render('./error/500')
  }
};


module.exports = {
  getCoupon,
  add_coupon,
  post_addcoupon,
  couponCheck,
  get_editcoupon,
  post_editcoupon,
  applycoupon,
  searchCoupon,
}


