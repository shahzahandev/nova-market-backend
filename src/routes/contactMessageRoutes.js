const express = require("express");
const router = express.Router();

const {createContactMessage, getAllContactMessages, getSingleContactMessage,updateContactMessageStatus, deleteContactMessage} = require("../controllers/contactMessageController");
const contactRateLimiter = require("../middleWare/contactRateLimiter");


// PUBLIC ROUTE: Customer does not need to log in
router.post("/createMessage", contactRateLimiter, createContactMessage);

// GET ALL MESSAGES
router.get("/allMessage", getAllContactMessages);

// GET SINGLE MESSAGE
router.get("/singleMessage/:id", getSingleContactMessage);

// UPDATE MESSAGE STATUS
router.patch("update/:id/status", updateContactMessageStatus);

// DELETE MESSAGE
router.delete("delete/:id", deleteContactMessage);

module.exports = router;