const express = require('express');
const router = express.Router();
const { getAllUsersController, singleUserController, deleteUserController, updateUserController, adminUpdateUserStatusController } = require('../controllers/userController');
const verifyToken = require('../middleWare/suceMiddleWare');
const authorizeAdmin = require('../middleWare/authorizeAdmin');

router.get("/allUsers", getAllUsersController);
router.get("/singleUser/:id", singleUserController);
router.delete("/deleteUser/:id", deleteUserController);
router.post("/updateUser/:id", updateUserController); // For User

router.patch("/admin/:id/status", verifyToken, authorizeAdmin, adminUpdateUserStatusController); // For Admin


module.exports = router;