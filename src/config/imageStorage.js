const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../upload');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
exports.uploadProductImg = multer({ storage: storage });

//===========================================

const updateUploadDir = path.join(__dirname, "../upload");

if (!fs.existsSync(updateUploadDir)) {
    fs.mkdirSync(updateUploadDir, { recursive: true });
}

const storageUpdateProduct = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, updateUploadDir);
    },
    filename(req, file, cb) {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

exports.updateProductImg = multer({
    storage: storageUpdateProduct,
});