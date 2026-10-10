const express = require('express');
const router = express.Router();
const { createCategoryController, getAllCategoryController, deleteCategroyController, updateCategoryController } = require('../controllers/categoryController');


router.post('/createCategory', createCategoryController);
router.get('/allCategory', getAllCategoryController);
router.delete('/deleteCategory/:id', deleteCategroyController);
router.put('/updateCategory/:id', updateCategoryController);

module.exports = router;