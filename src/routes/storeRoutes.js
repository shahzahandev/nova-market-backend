const express = require('express');
const router = express.Router();
const { createStoreInfo, getStoreInfo, updateStoreInfo } = require('../controllers/storeInfoController');
const verifyToken = require('../middleWare/suceMiddleWare');
const authorizeAdmin = require('../middleWare/authorizeAdmin');


router.post('/createStoreInfo',verifyToken, authorizeAdmin, createStoreInfo); // admin
router.get('/getStoreInfo', getStoreInfo);
router.patch('/udateStoreInfo', verifyToken, authorizeAdmin, updateStoreInfo); // admin

module.exports = router;