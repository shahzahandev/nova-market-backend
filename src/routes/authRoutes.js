const express = require('express');
const router = express.Router();
const { registrationController, loginController, forgotPasswordController, reSetPasswordController, resendEmailVerificationController, verifyEmailController } = require('../controllers/authController');


router.post('/register', registrationController);
router.post('/login', loginController);
router.post('/forgotPassword', forgotPasswordController);
router.post("/resetPassword/:token", reSetPasswordController);
router.post("/resendEmailVerification", resendEmailVerificationController);
router.post("/verifyEmailController/:token", verifyEmailController);


module.exports = router;