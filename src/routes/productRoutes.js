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
  deleteCategroyController,
  newProductController,
  featureProductController,
  dealsProductController
} = require('../controllers/productController');

const { uploadProductImg} = require("../middleWare/uploadMiddleware");


router.post( '/createProduct', uploadProductImg.array('images', 5), createProductController);
router.get('/allProduct',allProductController);
router.get('/allActiveProduct', allActiveProduct);
router.post('/singleProduct/:id', singleProductController);
router.delete('/deleteProduct/:id', deleteProductController);
router.post('/updateProduct/:id', uploadProductImg.array('images', 5), updateProductController);
router.get('/newProduct', newProductController);
router.get('/featureProduct', featureProductController);
router.get('/dealsProduct', dealsProductController);

// ==================== CATEGORY ROUTES ====================
router.post('/createCategory', createCategoryController);
router.get('/allCategory', getAllCategoryController);
router.delete('/deleteCategory/:id', deleteCategroyController);


module.exports = router;