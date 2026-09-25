const express = require('express');
const { createWishlistController, getAllWishlist, getSingleUserWishlist, deleteWishlist } = require('../controllers/wishlistController');
const router = express.Router();

router.post('/createWishlist', createWishlistController);
router.get('/allWishlist', getAllWishlist);
router.get('/singleWishlist/:userId', getSingleUserWishlist);
router.delete('/deleteWishlist/:id', deleteWishlist);

module.exports = router