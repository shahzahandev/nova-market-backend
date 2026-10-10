const express = require('express');
const router = express.Router();
const { createStoreInfo, getStoreInfo, updateStoreInfo } = require('../controllers/storeInfoController');


router.post('/createStoreInfo', createStoreInfo);
router.get('/getStoreInfo', getStoreInfo);
router.patch('/udateStoreInfo', updateStoreInfo);

module.exports = router;