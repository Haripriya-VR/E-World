const User = require('../models/users')
const productSchema = require('../models/products')
const Order = require('../models/order')
const Address = require('../models/Address')
const Cart = require('../models/cart');
const bcrypt = require("bcrypt");

const user_profile = async (req, res) => {
  try {
    if (req.session.email) {

      const user = await User.findOne({ email: req.session.email }).populate('address')

      const Address = user.address
      res.render('users/profile', { user, Address })
    }
  } catch (error) {
    res.render('error/500')
  }

}

// edit user details get
const editbio_get = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.session.email })

    res.render('users/edit-profile', { user })
  } catch (error) {
    res.render('error/500')
  }
}


// edit user details post
const edit_bio = async (req, res) => {
  try {

    const userId = await User.findOne({ email: req.session.email }).select('_id');
    const pass = req.body.password
    const newPass = await bcrypt.hash(req.body.password, 10);
    const editUser = await User.updateOne(
      { _id: userId },
      {
        $set: {
          userName: req.body.username,
          phone_number: req.body.phone_number,
          email: req.body.email,
          password: newPass
        }
      }
    );
    const editedone = await User.findOne({ email: req.session.email }).select('_id');
    res.redirect('/profile');


  } catch (error) {
    res.render('error/500')
  }
}



const profile_addAddress_get = async (req, res) => {
  try {
    const login = req.session.login
    const userId = await User.findOne({ email: req.session.email }).select('_id');
    const cart = await Cart.findOne({ userId: userId }).populate('items.productId')
    const cartQuantity = cart ? cart.items.length : 0;

    res.render('users/profile-addAddress', { login, cartQuantity })
  } catch (error) {
    res.render('error/500')
  }
}


const profile_addAddress_post = async (req, res) => {
  try {
    const login = req.session.login
    const userId = await User.findOne({ email: req.session.email }).select('_id');
    const address = new Address({
      fullName: req.body.username,
      mobile: req.body.phone_number,
      street: req.body.street_name,
      village: req.body.village,
      city: req.body.city,
      pinCode: req.body.pincode,
      landmark: req.body.landmark,
      district: req.body.district,
      state: req.body.state,
      userId: userId
    })
    const savedAddress = await address.save();

    await User.updateOne(
      { _id: userId },
      {
        $push: { address: savedAddress._id },
      }
    );
    res.redirect('/profile')

  } catch (error) {
    res.render('error/500')
  }

}



const profile_editAddress_get = async (req, res) => {
  try {
    const id = req.params.id
    const address = await Address.findOne({ _id: id });
    res.render('users/profile-editAddress', { address })
  } catch (error) {
    res.render('error/500')
  }

}


const profile_editAddress_post = async (req, res) => {
  try {
    const id = req.params.id;
    const userId = await User.findOne({ email: req.session.email }).select('_id');

    const updatedAddress = await Address.updateOne(
      { _id: id, userId: userId },
      {
        $set: {
          fullName: req.body.username,
          mobile: req.body.phone_number,
          street: req.body.street_name,
          village: req.body.village,
          city: req.body.city,
          pinCode: req.body.pincode,
          landmark: req.body.landmark,
          district: req.body.district,
          state: req.body.state,
        }
      }
    );

    res.redirect('/profile');
  } catch (error) {
    console.error('Error in profile_editAddress_post:', error);
  }
};


const delete_address = async (req, res) => {
  try {
    const id = req.params.id
    const address = await Address.deleteOne({ _id: id })
    res.redirect('/profile')
  } catch (error) {
    res.render('error/500')
  }
}


// profile orders
const profile_orders = async (req, res) => {
  try {
    const email = req.session.email
    const userId = await User.findOne({ email: email }).select('_id');
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const totalOrders = await Order.find({ userId: userId }).countDocuments();
    const totalPages = Math.ceil(totalOrders / limit);

    const orders = await Order.find({ userId: userId })
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);


    // Calculate the difference in days between the order date and the current date
    const currentDate = new Date();
    const orderDate = orders.date // Use order date if available
    const daysDifference = Math.floor((currentDate - orderDate) / (1000 * 60 * 60 * 24));

    // Check if the order is delivered and within the 30-day return window
    const showReturnForm = daysDifference <= 30;

    res.render('users/profile-orders', { orders, showReturnForm, email, page, totalPages, limit });
  } catch (error) {
    res.render('error/500')
  }
}


const ordered_products = async (req, res) => {
  try {
    const login = req.session.login;
    const id = req.params.id;
    const orders = await Order.findById(id).populate('products.productId');
    const products = orders ? orders.products : [];


    res.render('users/profile-orderedproducts', { products, login, orders });
  } catch (error) {

    res.render('error/500');
  }
};




const cancel_order = async (req, res) => {
  try {
    const status = req.body.status;
    const orderId = req.body.orderId;


    const order = await Order.findOne({ _id: orderId })

    for (let product of order.products) {
      await productSchema.updateOne({ _id: product.productId }, {
        $inc: {
          quantity: product.quantity
        }
      })
    }
    await Order.updateOne({ _id: orderId }, { $set: { orderStatus: status } });

    const newStatus = await Order.findOne({ _id: orderId })

    res.status(200).json({ success: true, status: newStatus.orderStatus })


  } catch (error) {
    console.error('Error cancelling order:', error);
    res.render('error/500');
  }
};

const returnOrder = async (req, res) => {
  try {

    const orderId = req.body.orderId.trim()
    const message = req.body.message

    const order = await Order.findOne({ _id: orderId })
    const userId = order.userId
    const totalprice = order.totalPrice

    if (message === 'other') {
      for (let products of order.products) {
        await productSchema.updateOne({ _id: products.productId }, {
          $inc: {
            quantity: products.quantity
          }
        })
      }

    }

    await Order.updateOne({ _id: orderId }, {
      $set: {
        orderStatus: "Returned"
      }
    })
    await User.updateOne({ _id: userId }, {
      $inc: {
        wallet: totalprice
      },
      $push: {
        walletHistory: {
          date: new Date(),
          amount: totalprice,
          message: "Deposit on order return"
        }
      }
    })
    res.json({ success: true })
  } catch (error) {
    res.render('./error/500')
  }


}


const invoice = async (req, res) => {
  try {
    const id = req.params.id;
    const Details = await Order.findById(id)
    const orders = await Order.findById(id).populate('products.productId').populate('address')
    const products = orders ? orders.products : [];
    const Address = orders ? orders.address : [];

    res.render('users/invoice', { Details, orders, products, Address })
  } catch (error) {
    res.render('./error/500')
  }
}

const wallet = async (req, res) => {
  try {
    const email = req.session.email
    const userId = await User.findOne({ email: email }).select('_id');
    const userDetails = await User.findOne({ _id: userId })
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const totalwalletHistory = userDetails.walletHistory.length;
    const totalPages = Math.ceil(totalwalletHistory / limit);


    res.render('users/wallet', {
      users: userDetails,
      email,
      page,
      totalPages,
      limit
    })

  } catch (error) {
    res.render('./error/500')
  }
}


module.exports = {
  user_profile,
  editbio_get,
  edit_bio,
  profile_addAddress_get,
  profile_addAddress_post,
  profile_editAddress_get,
  profile_editAddress_post,
  profile_orders,
  ordered_products,
  cancel_order,
  delete_address,
  invoice,
  returnOrder,
  wallet,

}