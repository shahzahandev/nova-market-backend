const express = require('express');
const router = express.Router();
const { createProductController, allProductController, singleProductController, deleteProductController, updateProductController } = require('../controllers/productController');
const { upload } = require('../config/imageStorage');

router.post('/createProduct', upload.array('photos', 5), createProductController);
router.get('/allProduct', allProductController);
router.post('/singleProduct', singleProductController);
router.delete('/deleteProduct/:id', deleteProductController);
router.post('/updateProduct/:id', updateProductController);

module.exports = router;