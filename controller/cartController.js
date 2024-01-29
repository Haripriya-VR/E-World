const products = require('../models/products');
const User = require('../models/users')
const Cart = require('../models/cart');
const couponSchema = require('../models/coupon')


// Get the cart page
const cart_get = async (req, res) => {
  try {
    const login = req.session.login;
    const userId = await User.findOne({ email: req.session.email }).select('_id');

    const cart = await Cart.findOne({ userId: userId }).populate('items.productId')
    const products = cart.items

    const cartQuantity = cart ? cart.items.length : 0;

    const cartTotal = cart.items.reduce((total, current) => total + current.quantity * current.productId.price, 0)

    res.render('users/cart', { products, cartQuantity, cart, login, cartTotal: cartTotal })
  } catch (error) {
    res.render('./error/500')
  }
}

const addtocart = async (req, res) => {
  try {
    const login = req.session.login;
    const product_id = req.params.id
    const userId = await User.findOne({ email: req.session.email }).select('_id');

    let cart = await Cart.findOne({ userId: userId })
    if (cart !== null) {
      const existingCart = cart.items.find((item) =>
        item.productId.equals(product_id)
      );
      if (existingCart) {

        const message = 'product is already exists in the cart'
        return res.json({ message })
        // existingCart.quantity += 1;
      } else {
        cart.items.push({ productId: product_id, quantity: 1 })
        
      }

      await cart.save();
      const cartQuantity = cart ? cart.items.length : 0;
      res.json({ success: true, cartQuantity, message: "Item added to the cart" });
    } else {
      const cart = new Cart({
        userId: userId,
        items: [{ productId: product_id, quantity: 1 }],
      });
      const cartQuantity = cart ? cart.items.length : 0;
      await cart.save();
      res.json({ success: true,cartQuantity, message: "Item added to the cart" });
    }

  } catch (error) {
    res.render('./error/500')

  }
}

const updateQuantity = async (req, res) => {
  try {
    const { productId, quantity, cartId } = req.body;

    const cart = await Cart.findOne({ _id: cartId })
      .populate({
        path: 'items',
        populate: {
          path: 'productId',
          model: 'product'
        }
      });

    if (!cart) {
      return res.status(404).json({ success: false, error: "Cart not found" });
    }

    const productInCart = cart.items.find((item) => item.productId._id.equals(productId));

    if (!productInCart) {
      return res.status(404).json({ success: false, error: 'Product is not found in the cart' });
    }

    productInCart.quantity = quantity;

    // Access the quantity property inside the productId object
    const productQuantity = productInCart.productId.quantity;

    let totalPrice = 0;
    cart.items.forEach((item) => {
      totalPrice += item.quantity * item.productId.price;
    });
    const cartTotal = cart.items.reduce((total, current) => total + current.quantity * current.productId.price, 0);

    await cart.save();

    res.status(200).json({ success: true, quantity: productInCart.quantity, totalPrice: totalPrice, cartTotal: cartTotal, productQuantity: productQuantity, });

  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

const delete_cart = async (req, res) => {
  const id = req.params.id;
  const userId = await User.findOne({ email: req.session.email }).select('_id');
  try {
    const cart = await Cart.findOne({ userId: userId }).populate('items.productId');
    const itemIndex = cart.items.findIndex(item => item.productId.toString() === id);
    if (itemIndex) {
      cart.items.splice(itemIndex, 1);
      await cart.save();

      res.redirect('/cart')
    } else {
      res.status(404).json({ success: false, message: 'Product not found in the cart' });
    }
  } catch (error) {
    res.render('./error/500')
  }
};

module.exports = {
  cart_get,
  addtocart,
  updateQuantity,
  delete_cart,
}

