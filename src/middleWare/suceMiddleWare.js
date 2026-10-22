const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "Authentication token is required.",
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Invalid authorization header.",
        });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET_KEY,
        (err, decoded) => {
            if (err) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired token.",
                });
            }

            req.user = decoded;
            next();
        }
    );
};

module.exports = verifyToken;