const express = require('express');
const router = express.Router();
const { paymentController, allOrder, codController, getSingleUserOrders, updateOrderStatus, paymentSuccess, paymentFail, paymentCancel } = require('../controllers/paymentController');


router.post("/payment", paymentController); // tested
router.get("/getSingleUserOrders/:userId", getSingleUserOrders);  // tested
router.get('/allOrder', allOrder);
router.post("/cod", codController);
router.patch("/updateStatus/:id", updateOrderStatus);

router.all("/payment/success", paymentSuccess);
router.all("/payment/fail", paymentFail);
router.all("/payment/cancel", paymentCancel);

module.exports = router;