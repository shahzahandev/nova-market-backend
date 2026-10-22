const express = require("express");
const router = express.Router();

const verifyToken = require("../middleWare/suceMiddleWare");
const authorizeAdmin = require("../middleWare/authorizeAdmin");

router.get( "/dashboard", verifyToken, authorizeAdmin, (req, res) => {
        res.status(200).json({
            success: true,
            message: "Admin access granted.",
        });
    }
);

module.exports = router;