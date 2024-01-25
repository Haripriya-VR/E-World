const products = require("../models/products");
const Category = require("../models/category");


// get product page
const products_page = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const page = parseInt(req.query.page) || 1;

    const totalProducts = await products.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);
    const product = await products.find()
      .populate('category')
      .skip((page - 1) * limit)
      .limit(limit);

    // const product = await products.find().populate('category');
    res.render('admin/products',{product,page,totalPages,totalProducts});

  } catch (error) {
    res.render('./error/500')
  }
};

// post products

// add products
const addproducts_get = async (req, res) => {
  const categories = await Category.find();
  res.render('admin/addproducts', { categories })
}

//  addproducts post
const products_post = async (req, res) => {
  try {
    const images = req.files.map(file => file.path);

    const categoryObject = await Category.findOne({ category: req.body.Category });
    const data = {
      name: req.body.productname,
      category: categoryObject._id,
      quantity: req.body.quantity,
      price: req.body.price,
      description: req.body.description,
      images: images
    }

    const insert = await products.insertMany([data]);

    res.redirect("/admin/products");
  } catch (error) {
    res.render('./error/500')
  }


}

// edit products get
const editproduct = async (req, res) => {
  try {
    const id = req.params.id;
    const categories = await Category.find();
    const product = await products.findOne({ _id: id });
    const description = product.description
    res.render('admin/edit-products', { product, categories ,description})
  } catch (error) {
    res.render('./error/500')
  }
}


const editproduct_post = async (req, res) => {
  try {
    const categoryObject = await Category.findOne({ category: req.body.Category });
    const images = req.files.map(file => file.path);
   
    if (images.length > 0) {
      const data = {
        name: req.body.productname,
        category: categoryObject._id,
        quantity: req.body.quantity,
        price: req.body.price,
        description: req.body.description,
        images: images
      }
      const id = req.params.id;
      await products.updateOne({ _id: id }, { $set: data })
    } else {
      const data = {
        name: req.body.productname,
        category: categoryObject._id,
        quantity: req.body.quantity,
        price: req.body.price,
        description: req.body.description

      }
      const id = req.params.id;
      await products.updateOne({ _id: id }, { $set: data })
    }

    res.redirect("/admin/products");
  } catch (error) {
    res.render('./error/500')
  }
}

// search products

const search_products = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const page = parseInt(req.query.page) || 1;

    const totalProducts = await products.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    const search_product = req.body.search
    const product = await products.find({ name: search_product })
    if (product) {
      res.render('admin/products', { product ,page,totalPages,totalProducts})
    }

  } catch (error) {

  }
}


// Function to activate a product
const activateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await activateOrDeactivateProduct(id, true); // Set the second parameter to true for activation
    res.redirect('/admin/products');
  } catch (error) {
    res.render('./error/500')
  }
};

// Function to deactivate a product
const deactivateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await activateOrDeactivateProduct(id, false); // Set the second parameter to false for deactivation
    res.redirect('/admin/products');
  } catch (error) {
    res.render('./error/500')
  }
};

// Shared function to activate or deactivate a product
const activateOrDeactivateProduct = async (productId, activate) => {
  try {
    const product = await products.findById(productId);

    if (product) {
      const newStatus = activate;
      await products.updateOne(
        { _id: productId },
        { $set: { status: newStatus } }
      );
    } else {
      throw new Error('Product not found');
    }
  } catch (error) {
    res.render('./error/500')
  }
};


module.exports = {
  products_page,
  addproducts_get,
  products_post,
  editproduct,
  editproduct_post,
  search_products,
  activateProduct,
  deactivateProduct,
}