const express = require('express');
const router = express.Router();
const { paymentController, allOrder, codController, getSingleUserOrders, updateOrderStatus, paymentSuccess, paymentFail, paymentCancel } = require('../controllers/paymentController');
const authorizeAdmin = require('../middleWare/authorizeAdmin');
const verifyToken = require('../middleWare/suceMiddleWare');


router.post("/payment", paymentController); // tested
router.get("/getSingleUserOrders/:userId", verifyToken, authorizeAdmin, getSingleUserOrders);  // tested admin
router.get('/allOrder', verifyToken, authorizeAdmin, allOrder); // admin
router.post("/cod", codController);
router.patch("/updateStatus/:id", verifyToken, authorizeAdmin, updateOrderStatus); // admin

router.all("/payment/success", paymentSuccess);
router.all("/payment/fail", paymentFail);
router.all("/payment/cancel", paymentCancel);

module.exports = router;