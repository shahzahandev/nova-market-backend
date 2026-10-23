const express = require("express");
const router = express.Router();
const { getDeliverySettings, updateDeliverySettings } = require("../controllers/deliveryController");
const authorizeAdmin = require("../middleWare/authorizeAdmin");
const verifyToken = require("../middleWare/suceMiddleWare");


router.get("/settings", getDeliverySettings);
router.put("/settings", verifyToken, authorizeAdmin, updateDeliverySettings); // admin

module.exports = router;