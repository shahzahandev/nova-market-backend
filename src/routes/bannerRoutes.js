const express = require('express');
const { upsertHeroSliderController, getHeroSliderController } = require('../controllers/bannerImgController');
const { uploadHeroImg } = require('../config/imageStorage');
const router = express.Router();




router.post('/createHeroSlider', uploadHeroImg.array('images', 6), upsertHeroSliderController);
router.get('/getHeroSlider', getHeroSliderController);

module.exports = router;
