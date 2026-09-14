const express = require("express");

const router = express.Router();

const {
  uploadBannerImg,
} = require("../middleWare/uploadBanner");

const {
  upsertHeroSliderController,
  getHeroSliderController,
} = require("../controllers/bannerImgController");

router.post(
  "/createHeroSlider",
  uploadBannerImg.array("images", 6),
  upsertHeroSliderController
);

router.get(
  "/getHeroSlider",
  getHeroSliderController
);

module.exports = router;