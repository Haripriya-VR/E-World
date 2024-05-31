const User = require('../models/users')
const Cart = require('../models/cart');
const Address = require('../models/Address');
const order = require('../models/order');
const Order = require('../models/order')
const paymentHelper = require('../helpers/paymentHelper');
const crypto = require('crypto');
const product = require('../models/products');
const { discountPrice } = require('../helpers/couponHelper');
const Coupon = require('../models/coupon')


// user side order management

const placeorder_post = async (req, res) => {
  try {
    let { paymentMethod, addressId,couponCode, walletAmount, orderStatus, dicountTotal } = req.body
    const login = req.session.login;
    const userId = await User.findOne({ email: req.session.email }).select('_id');
    const cart = await Cart.findOne({ userId: userId }).populate('items.productId');
    const users = await User.findOne({ _id: userId }).populate('address');

    // const Address = users.address;
    const orderAdd = await Address.find({ _id: addressId })

   const couponUser = await Coupon.findOneAndUpdate(
      { name: couponCode },
      { $push: { users: userId } },
      { new: true }
    );


    let walletBalance
    if (walletAmount) {
      walletBalance = Number(walletAmount)
    }

    let walletUsed
    let amountPayable
    if (walletAmount) {
      if (dicountTotal > walletBalance) {
        amountPayable = dicountTotal - walletBalance
        walletUsed = walletBalance
        paymentMethod = 'Razorpay'
      } else if (walletBalance > dicountTotal) {
        amountPayable = 0
        walletUsed = dicountTotal
        paymentMethod = 'wallet'
      }
    } else {
      amountPayable = dicountTotal
    }

    const cartproducts = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price,
    }))

    for (const item of cartproducts) {

      const quantityCheck = await product.findOne({ _id: item.productId }, { _id: 0, quantity: 1 })
      if (quantityCheck.quantity < item.quantity) {

        return res.json({ message: 'product is out of stock' })
      }
    }

    const orderAddress = orderAdd.map(item => ({
      addressId: item._id,
      fullName: item.fullName,
      mobile: item.mobile,
      street: item.street,
      village: item.village,
      city: item.city,
      pinCode: item.pinCode,
      landmark: item.landmark,
      district: item.district,
      state: item.state,
    }));



    for (const item of cartproducts) {
      const numericQuantity = parseInt(item.quantity);
      await product.updateOne(
        { _id: item.productId },
        { $inc: { quantity: -numericQuantity } }
      );
    }


    const orderData = new order({
      userId: userId,
      products: cartproducts,
      totalPrice: dicountTotal,
      paymentMethod: paymentMethod,
      orderStatus: orderStatus,
      address: orderAddress,
      orderStatus: orderStatus
    });

    await Cart.updateOne({ userId: userId }, { $pull: { items: { productId: { $in: cartproducts.map(product => product.productId) } } } });

    const ordered = await orderData.save();
    if (paymentMethod === 'COD' || amountPayable === 0) {
      if (walletAmount) {
        await users.updateOne({ _id: userId }, {
          $inc: {
            wallet: -walletUsed
          },
          $push: {
            walletHistory: {
              date: Date.now(),
              amount: -walletUsed,
              message: 'Used for purachse'
            }
          }
        })
      }
      return res.json({ codSuccess: true })
    } else if (paymentMethod === 'Razorpay') {
      const payment = await paymentHelper.razorpayPayment(ordered._id, amountPayable)
      return res.json({ payment: payment })
    }



    res.json({ success: true, dicountTotal, cartproducts, login })


  } catch (error) {
    res.render('./error/500')
  }
};





const verifyPayment = async (req, res) => {
  try {
    const { response, order } = req.body;
    const { user } = req.session;
    const hmac = crypto.createHmac('sha256', '5qBSJdrQgBVyqKRFku5Ht131');
    hmac.update(response.razorpay_order_id + '|' + response.razorpay_payment_id);
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature === response.razorpay_signature) {
      const orders = await Order.findOne({ _id: order.receipt });

      res.json({ paid: true });
    } else {
      res.json({ paid: false });
    }
  } catch (error) {
    res.render('./error/500')
  }
};




const orderconfirm_get = async (req, res) => {
  try {
    const login = req.session.login;
    const userId = await User.findOne({ email: req.session.email }).select('_id'); 
    const cart = await Cart.findOne({ userId: userId }).populate('items.productId')

    const cartTotal = cart.items.reduce((total, current) => total + current.quantity * current.productId.price, 0);

    const orders = await order.find({ userId: userId }).sort({ date: -1 }).limit(1).populate('products.productId').populate('address')
    const totalPrice = orders[0].totalPrice;
    const address = orders[0].address

    const products = orders.length > 0 ? orders[0].products : [];

    if (orders.length > 0 && orders[0].orderStatus === "Pending") {
      await order.updateOne({ _id: orders[0]._id }, {
        $set: {
          orderStatus: "Confirmed"
        }
      });
    }
    const cartQuantity = cart ? cart.items.length : 0;
    res.render('users/order-confirmed', { login, cartQuantity, products, orders, address, totalPrice })
  } catch (error) {
    res.render('./error/500')
  }
}


// =====================================================================================
// admin side order management
// =====================================================================================



const order_get = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 8

    const totalOrders = await order.countDocuments()
    const totalPages = Math.ceil(totalOrders / limit)


    const orders = await order.find().sort({ date: -1 }).skip((page - 1) * limit).limit(limit);
    res.render('admin/order', { orders, page, totalPages, limit })
  } catch (error) {
    res.render('error/500')
  }
}

const update_status = async (req, res) => {
  try {
    const id = req.params.id
    const currentStatus = req.body.status
    const orders = await order.updateOne({ _id: id }, { $set: { orderStatus: currentStatus } })
    const updatedorders = await order.find({ _id: id })
    res.redirect('/admin/orders')
  } catch (error) {
    res.render('./error/500')
  }
}

const order_details = async (req, res) => {
  try {
    const id = req.params.id;
    const orders = await order.findById(id).populate('products.productId')
      .populate('userId');
    const order_detail = await order.findById(id)
    const address = order_detail.address

    const products = orders ? orders.products : [];
    const user = orders.userId
    res.render('admin/order-details', { products, order_detail, address, user });

  } catch (error) {
    res.render('./error/500')
  }
};


module.exports = {
  placeorder_post,
  orderconfirm_get,
  order_get,
  order_details,
  update_status,
  verifyPayment,
}
