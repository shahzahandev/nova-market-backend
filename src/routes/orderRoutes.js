const express = require('express');
const router = express.Router();
const { paymentController, singletOrder, allOrder, codController } = require('../controllers/paymentController');


router.post("/payment", paymentController); // tested
router.get("/getOrder/:id", singletOrder);  // tested
router.get('/allOrder', allOrder);
router.post("/cod", codController);


module.exports = router;