const express = require("express");
const router = express.Router();

const {createContactMessage, getAllContactMessages, getSingleContactMessage,updateContactMessageStatus, deleteContactMessage} = require("../controllers/contactMessageController");
const contactRateLimiter = require("../middleWare/contactRateLimiter");
const authorizeAdmin = require("../middleWare/authorizeAdmin");
const verifyToken = require("../middleWare/suceMiddleWare");


// PUBLIC ROUTE: Customer does not need to log in
router.post("/createMessage", contactRateLimiter, createContactMessage); // admin

// GET ALL MESSAGES
router.get("/allMessage", verifyToken, authorizeAdmin, getAllContactMessages); // admin

// GET SINGLE MESSAGE
router.get("/singleMessage/:id", verifyToken, authorizeAdmin, getSingleContactMessage); // admin

// UPDATE MESSAGE STATUS
router.patch("/update/:id/status", verifyToken, authorizeAdmin, updateContactMessageStatus); // admin

// DELETE MESSAGE
router.delete("/delete/:id", verifyToken, authorizeAdmin, deleteContactMessage); // admin

module.exports = router;