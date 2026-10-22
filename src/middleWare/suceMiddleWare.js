const jwt = require('jsonwebtoken')

let suceMiddleWare = (req, res, next) => {
    let token = req.headers.authorization

    jwt.verify(token, process.env.JWT_SECRET_KEY, function (err, decoded) {
       if(err){
        return res.status(400).json({
            success: false,
            message: "Unauthorization.",
            error: err.message
        }); 
       } else {
        next();
       }
    });
}

module.exports = suceMiddleWare