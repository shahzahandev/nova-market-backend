const express = require("express");
const router = express.Router();
const { saveNotice, getNotice } = require("../controllers/noticeController");
const authorizeAdmin = require("../middleWare/authorizeAdmin");
const verifyToken = require("../middleWare/suceMiddleWare");

router.get("/getNotice", getNotice);
router.post("/saveNotice", verifyToken, authorizeAdmin, saveNotice); // admin
module.exports = router;