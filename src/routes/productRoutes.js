const express = require('express');
const router = express.Router();
const { createProductController, allProductController, singleProductController, deleteProductController, updateProductController, createCategoryController,getAllCategoryController, allActiveProduct, allActiveAndDiscountProduct } = require('../controllers/productController');
const { uploadProductImg, updateProductImg } = require('../config/imageStorage');

router.post('/createProduct', uploadProductImg.array('images', 5), createProductController);
router.get('/allProduct', allProductController);
router.get('/allActiveProduct', allActiveProduct)
router.get('/discountProduct', allActiveAndDiscountProduct)
router.post('/singleProduct/:id', singleProductController);
router.delete('/deleteProduct/:id', deleteProductController);
router.post('/updateProduct/:id', updateProductImg.array('images', 5), updateProductController);




router.post('/createCategory', createCategoryController);
router.get('/allCategory', getAllCategoryController)

module.exports = router;