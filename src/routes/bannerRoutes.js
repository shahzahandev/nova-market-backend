const express = require('express');
const { upsertHeroSliderController, getHeroSliderController } = require('../controllers/bannerImgController');
const { uploadHeroImg } = require('../config/imageStorage');
const router = express.Router();




router.post('/heroSlider', uploadHeroImg.array('images', 6), upsertHeroSliderController);
router.get('/heroSlider', getHeroSliderController);

module.exports = router;