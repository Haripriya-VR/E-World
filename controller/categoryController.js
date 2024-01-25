const category = require('../models/category');
const products = require('../models/products')


  
const category_get = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      
      const totalCatgories = await category.countDocuments();  
      const totalPages = Math.ceil(totalCatgories / limit);

      const categories = await category.find().skip((page - 1 )*limit).limit(limit);
      const categoriesWithProductCount = [];

      for (const categoryItem of categories) {
        const productCount = await products.countDocuments({ category: categoryItem._id });
        const categoryWithCount = {
          category: categoryItem.category,
          productCount: productCount,
          status: categoryItem.status,
          _id: categoryItem._id, 
        };

        categoriesWithProductCount.push(categoryWithCount);
      }
      
      res.render('admin/category', { categories, categories: categoriesWithProductCount , page, totalPages, limit });
    } catch (error) {
      console.error('Error fetching categories with product count:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
// get add category
const add_category = async(req,res)=>{
    res.render('admin/addcategory')
}


// add category post
const category_post = async (req, res) => {
  const categoryData = {
      category: req.body.categoryname, 
      status: req.body.status,
  };

  const categoryInsert = await category.insertMany([categoryData]);
  res.redirect("/admin/category");
 
};

const category_check = async(req,res)=>{
  try {
    const {categoryname} = req.body
    const existingCategory = await category.findOne({ category: categoryname });
    const message = 'category already exists'
    if (existingCategory) {
      return res.json({success:true, message}) 
     } 
  } catch (error) {
    
  }
}
 

const search_category = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 8;
      
      const totalCatgories = await category.countDocuments();  
      const totalPages = Math.ceil(totalCatgories / limit);

        const searchTerm = req.body.search;
        const searchCategory = await category.find({ category: searchTerm });
        res.render('admin/category', { categories: searchCategory ,search:searchTerm,page, totalPages, limit });
    } catch (error) {
      res.render('./error/500')
    }
};


const get_editcategory = async (req, res) => {
    try {
      const id = req.params.id;
      const categoryToEdit = await category.findById(id);
  
      if (!categoryToEdit) {
        // Handle case where the category with the given id is not found
        return res.status(404).send('Category not found');
      }
  
      res.render('admin/edit-category', { categoryToEdit });
    } catch (error) {
      res.render('./error/500')
    }
  };

// post edit category
  const edit_category = async (req, res) => {
    try {
      const id = req.params.id;
      const editCategoryData = {
        category: req.body.categoryname,
     };
      await category.updateOne({ _id: id }, 
                               { $set: editCategoryData });
    
      res.redirect("/admin/category");
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).send("Internal Server Error");
    }
  };

// Function to activate a category
const activateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        await activateOrDeactivateCategory(id, true); // Set the second parameter to true for activation
        res.redirect('/admin/category');
    } catch (error) {
      res.render('./error/500')
    }
};

// Function to deactivate a category
const deactivateCategory = async (req, res) => {
    try {
        const id = req.params.id;
        await activateOrDeactivateCategory(id, false); // Set the second parameter to false for deactivation
        res.redirect('/admin/category');
    } catch (error) {
      res.render('./error/500')
    }
};

// Shared function to activate or deactivate a category
const activateOrDeactivateCategory = async (categoryId, activate) => {
    try {
        const categories = await category.findById(categoryId);

        if (categories) {
            // Convert activate to a boolean value explicitly
            const newStatus = Boolean(activate);
            await category.updateOne(
                { _id: categoryId },
                { $set: { status: newStatus } }
            );
        } else {
            throw new Error('Category not found');
        }
    } catch (error) {
        throw error;
    }
};


  

module.exports = {
    category_get,
    add_category,
    category_post,
    category_check,
    search_category,
    get_editcategory,
    edit_category,
    activateCategory,
    deactivateCategory,
}