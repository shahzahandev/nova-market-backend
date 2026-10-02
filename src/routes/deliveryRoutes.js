const express = require("express");
const router = express.Router();
const { getDeliverySettings, updateDeliverySettings } = require("../controllers/deliveryController");
// tomar admin auth middleware boshao
// const { isAdmin } = require("../middlewares/auth");

router.get("/settings", getDeliverySettings);
router.put("/settings", /* isAdmin, */ updateDeliverySettings); // admin middleware dite bhulo na

module.exports = router;