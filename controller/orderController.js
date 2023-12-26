const User = require('../models/users')
const Cart = require('../models/cart');
const Address = require('../models/Address');
const order = require('../models/order');
const paymentHelper = require('../helpers/paymentHelper');
const address = require('../models/Address');


// user side order management

const placeorder_post = async (req, res) => {
  try {
    const login = req.session.login;
    const userId = await User.findOne({ email: req.session.email }).select('_id');
    const cart = await Cart.findOne({ userId: userId }).populate('items.productId');
    const users = await User.findOne({ _id: userId }).populate('address');
    const Address = users.address;

    const { paymentMethod, addressId, orderStatus } = req.body

    const cartproducts = cart.items.map(item => ({
      productId: item.productId._id,
      quantity: item.quantity,
      price: item.productId.price,
    }))

    const cartTotal = cart.items.reduce((total, current) => total + current.quantity * current.productId.price, 0);


    const orderData = new order({
      userId: userId,
      products: cartproducts,
      totalPrice: cartTotal,
      paymentMethod: paymentMethod,
      orderStatus: orderStatus,
      address: addressId, 
      orderStatus: orderStatus
    });

    const ordered = await orderData.save();
    if(paymentMethod === 'COD'){
      await Cart.updateOne({ userId: userId }, { $pull: { items: { productId: { $in: cartproducts.map(product => product.productId) } } } });
      return res.json({ codSuccess : true})
    }else if(paymentMethod === 'Razorpay'){
      const payment = await paymentHelper.razorpayPayment( ordered._id, ordered.totalPrice )
      await Cart.updateOne({ userId: userId }, { $pull: { items: { productId: { $in: cartproducts.map(product => product.productId) } } } });
      console.log('payment',payment);
      return res.json({payment:payment})
    }

    res.json({ success: true, cartTotal, Address, cartproducts, login })
   
    await Cart.updateOne({ userId: userId }, { $pull: { items: { productId: { $in: cartproducts.map(product => product.productId) } } } });

  } catch (error) {
    console.log('Error in placeorder_post:', error);
    
  }
};



const verifyPayment=async(req,res)=>{
  try {

    console.log('verufy pyament here');

  } catch (error) {
    console.error("failed to verify the payment",error);
  }
}



const orderconfirm_get = async (req, res) => {
  try {
    const login = req.session.login;
    const userId = await User.findOne({ email: req.session.email }).select('_id');
    const cart = await Cart.findOne({ userId: userId }).populate('items.productId')

    const cartTotal = cart.items.reduce((total, current) => total + current.quantity * current.productId.price, 0);

    const orders = await order.find({ userId: userId }).sort({ date: -1 }).limit(1).populate('products.productId').populate('address')

    const products = orders.length > 0 ? orders[0].products : [];

    if (orders.length > 0 && orders[0].orderStatus === "Pending") {
      await order.updateOne({ _id: orders[0]._id }, {
        $set: {
          orderStatus: "Confirmed"
        }
      });
    }

    const cartQuantity = cart ? cart.items.length : 0;
    res.render('users/order-confirmed', { login, cartQuantity, products, orders, cartTotal })
  } catch (error) {
    console.log('error in order-confirmed', error);
  }
}


// =====================================================================================
// admin side order management
// =====================================================================================



const order_get = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 8
    const limit = parseInt(req.query.limit) || 1

    const totalOrders = await order.countDocuments()
    const totalPages = Math.ceil(totalOrders / limit)


    const orders = await order.find().sort({ date: 1 }).skip((page - 1) * limit).limit(limit);
    res.render('admin/order', { orders,page,totalPages,limit })
  } catch (error) {
    res.render('error/500')
  }
}

const update_status = async (req, res) => {
  const id = req.params.id
  const currentStatus = req.body.status
  const orders = await order.updateOne({ _id: id }, { $set: { orderStatus: currentStatus } })
  const updatedorders = await order.find({ _id: id })
  res.redirect('/admin/orders')

}

const order_details = async (req, res) => {
  try {
    const id = req.params.id;
    const orders = await order.findById(id).populate('products.productId')
    .populate('userId');
    const order_detail = await order.findById(id)
    const addressId = await order.findById(id).populate("address");
    const populateAddress = addressId.address
    const address = await Address.findById(populateAddress);
    const products = orders ? orders.products : [];
    const user = orders.userId
    // console.log('orders',orders);
    res.render('admin/order-details', { products,order_detail,address,user });

  } catch (error) {
    console.log('error in ordered products', error);
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
