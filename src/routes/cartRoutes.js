const express = require('express');
const router = express.Router();
const { allCard, cartdelete, getSingleCard, increDecre, createCart } = require('../controllers/cardController');

router.post('/create', createCart); // tested
router.post('/update/:id', increDecre); // tested
router.get('/single/:userId', getSingleCard); // tested
router.delete('/delete/:id', cartdelete); // tested
router.get('/all', allCard); 

module.exports = router;