const express = require('express');
const router = express.Router();
const { createCategoryController, getAllCategoryController, deleteCategroyController, updateCategoryController, getAllActiveCategoryController } = require('../controllers/categoryController');
const authorizeAdmin = require('../middleWare/authorizeAdmin');
const verifyToken = require('../middleWare/suceMiddleWare');


router.post('/createCategory', verifyToken, authorizeAdmin, createCategoryController); // admin
router.get('/allCategory', getAllCategoryController);
router.get('/allActiveCategory', getAllActiveCategoryController); 
router.delete('/deleteCategory/:id', verifyToken, authorizeAdmin, deleteCategroyController); // admin
router.put('/updateCategory/:id', verifyToken, authorizeAdmin, updateCategoryController); // admin

module.exports = router;