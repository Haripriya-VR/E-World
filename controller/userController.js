const user = require("../models/users")
const product = require('../models/products')
const Category = require('../models/category')
const cart = require('../models/cart')
const bcrypt = require("bcrypt");
const adminAuth = require("../middlewares/AdminAuth")
const UserAuth = require("../middlewares/UserAuth")
const User = require('../models/users')


const home_get = async (req, res) => {
  try {
    const login = req.session.login
    const products = await product.find({ status: true });

    const email = req.session.email;
    const userId = await User.findOne({ email: email }).select('_id');

    const Cart = await cart.findOne({ userId: userId });

    const cartQuantity = Cart ? Cart.items.length : 0;

    res.render('./users/userhome', { products, cartQuantity, login })
  } catch (error) {
    res.render('error/500')
  }
}

// USER SIGNUP-get
const usersignup = (req, res) => {
  try {
    res.render("./users/signup")
  } catch (error) {
    res.render('error/500')
  }

}

// USER SIGNUP-POST
const usersignup_post = async (req, res) => {
  try {
    const { email } = req.body;

    const check = await user.find({ email: req.body.email })
    const existingUser = await user.findOne({ email: email });


    if (check == '') {
      const pass = await bcrypt.hash(req.body.password, 10);

      const data = {
        userName: req.body.username,
        phone_number: req.body.phone_number,
        email: req.body.email,
        password: pass,
      }
      req.session.username = data.userName
      req.session.data = data;
      req.session.email = data.email
      req.session.signotp = true;

      res.redirect("/users/otp-senting");

    } if (existingUser) {
      req.flash("errmsg", "*User with this email Already exist")

      res.redirect('/signup')
      console.log("user already exist");

    }
  } catch (error) {
    res.render('error/500')
  }
}

// get user login
const userlogin = (req, res) => {
  try {
    res.render('./users/login')
  } catch (error) {
    res.render('error/500')
  }
}

const login_post = async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFound = await user.findOne({ email: email });
    const hashed_password = userFound.password
    const isMatch = await bcrypt.compare(password, hashed_password)
    if (isMatch) {
      req.session.login = true;
      req.session.email = req.body.email
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  } catch (error) {
    console.error(error);
    res.render('error/500')
  }
};

// LOGOUT
const logout = (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
        res.send('Error');
      } else {
        res.redirect("/login");
      }
    });
  } catch (error) {
    res.render('error/500')
  }
};

const checkUserBlocked = async (req, res, next) => {
  try {
    const userId = req.session.email;
    const users = await User.find({ email: userId });
    if (users.length > 0) {
      const user = users[0];
      if (user.ISbanned) {
        console.log('User is banned, destroying session.');
        req.session.destroy((err) => {
          if (err) {
            console.error('Error destroying session:', err);
          }
          res.redirect('/login');
        });
      } else {
        console.log('User is not banned, proceeding to the next middleware.');
        next();
      }
    } else {
      console.log('User not found.');
      res.redirect('/login');
    }
  } catch (error) {
    console.error('Error checking user blocked status:', error);
    res.render('error/500')
  }
};


// const user_profile = (req,res)=>{
//     console.log('session',req.session.email);
//     if (req.session.email) {
//         res.render('users/profile')
//     }

// }


// product view
const product_get = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const totalProducts = await product.countDocuments()
    const totalPages = Math.floor(totalProducts / limit)
  
    const login = req.session.login;
    let products;

    const categories = await Category.find();
    const selectedCategory = req.query.category;

    const priceSort = req.query.price;


    const prodct = await product.find({ status: true})
    const email = req.session.email;
    const userId = await User.findOne({ email: email }).select('_id');
    const Cart = await cart.findOne({ userId: userId });
    const cartQuantity = Cart ? Cart.items.length : 0;


      // Sorting by price
      const sortOptions = {};
        
      if (priceSort === 'a-z') {
       const ascending = await product.find({ status: true}).sort({price:1}); // Ascending

       return res.render('users/products', { products:ascending, login, categories, selectedCategory, cartQuantity, page, totalPages, limit });

      } else if (priceSort === 'z-a') {
        const decenting = await product.find({ status: true}).sort({price:-1}); // Descending

       return res.render('users/products', { products:decenting, login, categories, selectedCategory, cartQuantity, page, totalPages, limit });
      }

    if (prodct) {
      if (selectedCategory) {

        products = await product.find({ category: selectedCategory, status: true })
                                .populate('category')
                                .sort(sortOptions)
                                .skip((page - 1) * limit)
                                .limit(limit);
        
      } else {
        products = await product.find({ status: true }).skip((page - 1) * limit).limit(limit);
      }

      res.render('users/products', { products, login, categories, selectedCategory, cartQuantity, page, totalPages, limit });
    }

  } catch (error) {
    console.error('Error fetching categories or products:', error);
    res.render('error/500')
  }
};

// product search

const searchProducts = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;

    const totalProducts = await product.countDocuments()
    const totalPages = Math.floor(totalProducts / limit)


    const searchTerm = req.body.search;
    const searchProducts = await product.find({ name: searchTerm });


    const login = req.session.login;
    const email = req.session.email;
    const userId = await User.findOne({ email: email }).select('_id');
    const Cart = await cart.findOne({ userId: userId });
    const cartQuantity = Cart ? Cart.items.length : 0;


    const categories = await Category.find();


    res.render('users/products', { products: searchProducts, login, cartQuantity, categories, page, totalPages, limit });
  } catch (error) {
    console.log('search products ', error);
    // Handle the error appropriately, perhaps render an error page
    res.status(500).send('Internal Server Error');
  }
}



// single product detail page get
const single_product = async (req, res) => {
  try {
    const productId = req.params.productId
    const login = req.session.login
    const email = req.session.email;
    const userId = await User.findOne({ email: email }).select('_id');

    const Cart = await cart.findOne({ userId: userId });

    const cartQuantity = Cart ? Cart.items.length : 0;
    const product_details = await product.find({ _id: productId, status: true })
    const products = await product.find({ status: true })
    console.log('products in single page', products);
    if (product_details) {
      res.render('users/product-details', { products, product_details, login, cartQuantity })
    }
  } catch (error) {
    res.render('error/500')
  }
}


const wishlist_get= (req,res)=>{
  res.render('')
}


module.exports = {
  home_get,
  usersignup,
  usersignup_post,
  userlogin,
  login_post,
  product_get,
  single_product,
  logout,
  checkUserBlocked,
  searchProducts,
  
}






