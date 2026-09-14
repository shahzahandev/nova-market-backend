// const express = require('express');
// const router = express.Router();
// const { createProductController, allProductController, singleProductController, deleteProductController, updateProductController, createCategoryController,getAllCategoryController, allActiveProduct, allActiveAndDiscountProduct, deleteCategroyController } = require('../controllers/productController');
// const { uploadProductImg, updateProductImg } = require('../config/imageStorage');

// // router.post('/createProduct', uploadProductImg.array('images', 5), createProductController);
// router.get('/allProduct', allProductController);
// router.get('/allActiveProduct', allActiveProduct)
// router.get('/discountProduct', allActiveAndDiscountProduct)
// router.post('/singleProduct/:id', singleProductController);
// router.delete('/deleteProduct/:id', deleteProductController);
// // router.post('/updateProduct/:id', updateProductImg.array('images', 5), updateProductController);




// router.post('/createCategory', createCategoryController);
// router.get('/allCategory', getAllCategoryController)
// router.delete('/deleteCategory/:id', deleteCategroyController);

// module.exports = router;




const express = require('express');

const router = express.Router();

const {
  createProductController,
  allProductController,
  singleProductController,
  deleteProductController,
  updateProductController,
  createCategoryController,
  getAllCategoryController,
  allActiveProduct,
  allActiveAndDiscountProduct,
  deleteCategroyController
} = require('../controllers/productController');

const {
  uploadProductImg
} = require('../middleware/uploadMiddleware');


// ==================== PRODUCT ROUTES ====================

// Create Product
router.post(
  '/createProduct',
  uploadProductImg.array('images', 5),
  createProductController
);


// Get All Products
router.get(
  '/allProduct',
  allProductController
);


// Get All Active Products
router.get(
  '/allActiveProduct',
  allActiveProduct
);


// Get Discount Products
router.get(
  '/discountProduct',
  allActiveAndDiscountProduct
);


// Get Single Product
router.post(
  '/singleProduct/:id',
  singleProductController
);


// Delete Product
router.delete(
  '/deleteProduct/:id',
  deleteProductController
);


// Update Product
router.post(
  '/updateProduct/:id',
  uploadProductImg.array('images', 5),
  updateProductController
);


// ==================== CATEGORY ROUTES ====================

// Create Category
router.post(
  '/createCategory',
  createCategoryController
);


// Get All Categories
router.get(
  '/allCategory',
  getAllCategoryController
);


// Delete Category
router.delete(
  '/deleteCategory/:id',
  deleteCategroyController
);


module.exports = router;