const express = require("express");
const router = express.Router();

const { uploadBannerImg,} = require("../middleWare/uploadBanner");
const { upsertHeroSliderController, getHeroSliderController,} = require("../controllers/bannerImgController");
const verifyToken = require("../middleWare/suceMiddleWare");
const authorizeAdmin = require("../middleWare/authorizeAdmin");



router.post("/createHeroSlider", uploadBannerImg.array("images", 6), verifyToken, authorizeAdmin, upsertHeroSliderController); // admin
router.get("/getHeroSlider", getHeroSliderController );




module.exports = router;