const express = require('express');
const router = express.Router();
const { getAllUsersController, singleUserController, deleteUserController, updateUserController } = require('../controllers/userController');

router.get("/allUsers", getAllUsersController);
router.post("/singleUser/:id", singleUserController);
router.delete("/deleteUser/:id", deleteUserController);
router.post("/udateUser/:id", updateUserController);


module.exports = router;