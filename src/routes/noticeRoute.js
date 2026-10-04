const express = require("express");
const router = express.Router();
const { saveNotice, getNotice } = require("../controllers/noticeController");

router.get("/getNotice", getNotice);
router.post("/saveNotice", saveNotice);
module.exports = router;