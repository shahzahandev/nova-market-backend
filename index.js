require('dotenv').config();
require('node:dns/promises').setServers(['1.1.1.1','8.8.8.8']);
const cors = require('cors');
const express = require('express');
const app = express();
const dbConnection = require('./config/dbConnection');
const {  registrationController, loginController, forgotPasswordController, reSetPasswordController, resendEmailVerificationController, verifyEmailController } = require('./controllers/registrationController');
const { rateLimit } = require('express-rate-limit'); 
const { getAllUsersController, singleUserController, deleteUserController, updateUserController } = require('./controllers/userController');
const { productController, allProductController, singleProductController, deleteProductController, updateProductController } = require('./controllers/productController');
const { upload, uploadUser } = require('./config/imageStorage');
const { createCart, increDecre, getCard, cartdelete } = require('./controllers/cardController');
const { paymentController, getOrder } = require('./controllers/paymentController');

// <==== middleware ====>
app.use(express.json());
app.use(cors());


// <==== Database connetion =====>
dbConnection();

// <==== Authentication Rotue =====>
app.post("/registration", uploadUser.single('photo'), registrationController);
app.post("/login", loginController);
app.post("/forgotPassword", forgotPasswordController);
app.post("/resetPassword/:token", reSetPasswordController);
app.post("/resendEmailVerification", resendEmailVerificationController);
app.post("/verifyEmailController/:token", verifyEmailController);

// <==== Product Management Rotue =====>
app.post('/createProduct', upload.array('photos', 5), productController);
app.get('/allProduct', allProductController);
app.post('/singleProduct', singleProductController);
app.delete('/deleteProduct', deleteProductController);
app.post('/updateProduct/:id', updateProductController);


// <==== Card Management Route =====>
app.post('/cart/create', createCart); // tested
app.post('/cart/update/:id', increDecre); // tested
app.get('/cart/:userId', getCard); // tested
app.delete('/cart/delete/:id', cartdelete); // tested

 

// <==== Order Management Route =====>
app.post("/payment", paymentController); // tested
app.get("/getOrder/:id", getOrder);  // tested


// <==== User Management Route =====>
app.get("/allUsers", getAllUsersController);
app.post("/singleUser/:id", singleUserController);
app.delete("/deleteUser/:id", deleteUserController);
app.post("/udateUser/:id", updateUserController);


// <=== = PORT ====> 
const port = process.env.PORT || 5000
app.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`);
});


// <==== limiter ====>
// const limiter = rateLimit({
// 	windowMs: 15 * 60 * 1000,
// 	limit: 100,
// 	standardHeaders: 'draft-8',
// 	legacyHeaders: false, 
// 	ipv6Subnet: 56,
// })

// app.use(limiter)
