const express = require('express');
const router = express.Router();

const { createProductController, allProductController, singleProductController, deleteProductController, updateProductController, allActiveProduct, newProductController, featureProductController, dealsProductController,} = require('../controllers/productController');
const { uploadProductImg} = require("../middleWare/uploadMiddleware");
const verifyToken = require('../middleWare/suceMiddleWare');
const authorizeAdmin = require('../middleWare/authorizeAdmin');


router.post( '/createProduct', uploadProductImg.array('images', 5), verifyToken, authorizeAdmin, createProductController); // admin
router.get('/allProduct', allProductController);
router.get('/allActiveProduct', allActiveProduct);
router.post('/singleProduct/:id', singleProductController);
router.delete('/deleteProduct/:id', verifyToken, authorizeAdmin, deleteProductController); // admin
router.post('/updateProduct/:id', uploadProductImg.array('images', 5), verifyToken, authorizeAdmin, updateProductController); // admin

router.get('/newProduct', newProductController);
router.get('/featureProduct', featureProductController);
router.get('/dealsProduct', dealsProductController);


module.exports = router;