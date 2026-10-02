const express = require('express');
const router = express.Router();
const { paymentController, allOrder, codController, getSingleUserOrders } = require('../controllers/paymentController');


router.post("/payment", paymentController); // tested
router.get("/getSingleUserOrders/:userId", getSingleUserOrders);  // tested
router.get('/allOrder', allOrder);
router.post("/cod", codController);


module.exports = router;