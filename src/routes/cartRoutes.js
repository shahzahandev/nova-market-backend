const express = require('express');
const router = express.Router();
const { allCart, cartdelete, getSingleCart, increDecre, createCart } = require('../controllers/cardController');

router.post('/create', createCart); // tested
router.post('/update/:id', increDecre); // tested
router.get('/single/:userId', getSingleCart); // tested
router.delete('/delete/:id', cartdelete); // tested
router.get('/all', allCart); 

module.exports = router;