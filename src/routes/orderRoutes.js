const express = require('express');
const router = express.Router();
const { paymentController, allOrder, codController, getSingleUserOrders, updateOrderStatus } = require('../controllers/paymentController');


router.post("/payment", paymentController); // tested
router.get("/getSingleUserOrders/:userId", getSingleUserOrders);  // tested
router.get('/allOrder', allOrder);
router.post("/cod", codController);
router.patch("/updateStatus/:id", updateOrderStatus);


module.exports = router;