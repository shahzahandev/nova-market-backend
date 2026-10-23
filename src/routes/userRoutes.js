const express = require('express');
const router = express.Router();
const { getAllUsersController, singleUserController, deleteUserController, updateUserController, adminUpdateUserStatusController } = require('../controllers/userController');
const verifyToken = require('../middleWare/suceMiddleWare');
const authorizeAdmin = require('../middleWare/authorizeAdmin');

router.get("/allUsers", verifyToken, authorizeAdmin, getAllUsersController);  // For Admin
router.get("/singleUser/:id", verifyToken, authorizeAdmin, singleUserController);  // For Admin
router.delete("/deleteUser/:id", verifyToken, authorizeAdmin, deleteUserController);  // For Admin
router.post("/updateUser/:id", updateUserController); // For User

router.patch("/admin/:id/status", verifyToken, authorizeAdmin, adminUpdateUserStatusController); // For Admin


module.exports = router;