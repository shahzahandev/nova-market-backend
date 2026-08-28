const express = require('express');
const router = express.Router();
const { registrationController, loginController, forgotPasswordController, reSetPasswordController, resendEmailVerificationController, verifyEmailController } = require('../controllers/authController');


router.post('/register', registrationController);
router.post('/login', loginController);
router.post('/forgotPassword', forgotPasswordController);
router.post("/resetpassword/:token", reSetPasswordController);
router.post("/resendEmailVerification", resendEmailVerificationController);
router.post("/verifyemail/:token", verifyEmailController);


module.exports = router;