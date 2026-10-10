const express = require('express');
const router = express.Router();

const { createProductController, allProductController, singleProductController, deleteProductController, updateProductController, allActiveProduct, newProductController, featureProductController, dealsProductController,} = require('../controllers/productController');
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


module.exports = router;