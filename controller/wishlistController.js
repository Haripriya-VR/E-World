const products = require('../models/products');
const User = require('../models/users');
const Cart = require('../models/cart');
const wishlist = require('../models/wishlist');

// Wishlist get
const wishlist_get = async (req, res) => {
  try {
    const login = req.session.login;
    const userId = await User.findOne({ email: req.session.email }).select('_id');
    const cart = await Cart.findOne({ userId: userId }).populate('items.productId')
    const cartQuantity = cart ? cart.items.length : 0;

    // const Wishlist = wishlist.find({userId:userId}).populate('products')

    const Wishlist = await wishlist.findOne({ userId: userId })
      .populate('products')
      .exec();


    res.render('users/wishlist', { login, cartQuantity, Wishlist });
  } catch (error) {
    res.render('./error/500')
  }
}


// post add to wishlist 
const addtowishlist = async (req, res) => {
  try {

    const productId = req.params.id;
    const email = req.session.email;

    const userDocument = await User.findOne({ email: email }, '_id');
    const userId = userDocument ? userDocument._id : null;

    const Wishlist = await wishlist.findOne({ userId: userId });

    if (Wishlist) {
      const exist = await wishlist.findOne({ products: productId });

      if (exist) {
        return res.json({ success: false, message: 'Product already exists in the wishlist' });

      } else {
        await wishlist.updateOne(
          { userId: userId },
          {
            $addToSet: {
              products: productId
            }
          }
        );
      }
      return res.json({ success: true, message: 'Added to wishlist' });
    } else {
      const newWishlist = new wishlist({
        userId: userId,
        products: [productId]
      });

      await newWishlist.save();
      return res.status(200).json({ success: true, message: 'Added to wishlist' });
    }
  } catch (error) {
    res.render('./error/500')
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// delete wishlist
const removeProducts = async (req, res) => {
  try {
    const userId = await User.findOne({ email: req.session.email }).select('_id');
    const login = req.session.login;
    const cart = await Cart.findOne({ userId: userId }).populate('items.productId')
    const cartQuantity = cart ? cart.items.length : 0;

    const id = req.params.id;

    await wishlist.updateOne(
      { userId: userId },
      { $pull: { products: id } }
    );

    const Wishlist = await wishlist.findOne({ userId: userId })
      .populate('products')
      .exec();
    res.render('users/wishlist', { login, cartQuantity, Wishlist });
  } catch (error) {
    res.render('./error/500')
  }
}

module.exports = {
  wishlist_get,
  addtowishlist,
  removeProducts
}