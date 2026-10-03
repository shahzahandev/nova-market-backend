const express = require("express");
const router = express.Router();

const {createWhatsApp, getWhatsApp, updateWhatsApp,} = require("../controllers/whatsappController");



router.post("/creatWhatsapp", createWhatsApp);
router.get("/getWhatsapp", getWhatsApp);
router.put("/updateWhatsapp", updateWhatsApp);

module.exports = router;