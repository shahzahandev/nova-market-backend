const express = require("express");
const router = express.Router();

const {createWhatsApp, getWhatsApp, updateWhatsApp,} = require("../controllers/whatsappController");
const authorizeAdmin = require("../middleWare/authorizeAdmin");
const verifyToken = require("../middleWare/suceMiddleWare");



router.post("/creatWhatsapp", verifyToken, authorizeAdmin, createWhatsApp); // admin
router.get("/getWhatsapp", getWhatsApp);
router.put("/updateWhatsapp", verifyToken, authorizeAdmin, updateWhatsApp); // admin

module.exports = router;