// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const uploadDir = path.join(__dirname, '../upload');

// if (!fs.existsSync(uploadDir)) {
//     fs.mkdirSync(uploadDir, { recursive: true });
// }

// // ---- Shared helper: safely delete a file from the upload folder ----
// function deleteFileIfExists(filename) {
//     if (!filename) return;
//     const filePath = path.join(uploadDir, filename);
//     fs.unlink(filePath, (err) => {
//         if (err && err.code !== 'ENOENT') {
//             console.error(`Failed to delete file ${filename}:`, err.message);
//         }
//     });
// }

// // ---- Product create images ----
// const storageProduct = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, uniqueSuffix + '-' + file.originalname);
//     }
// });
// exports.uploadProductImg = multer({ storage: storageProduct });

// // ---- Product update images ----
// const storageUpdateProduct = multer.diskStorage({
//     destination(req, file, cb) {
//         cb(null, uploadDir);
//     },
//     filename(req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, uniqueSuffix + '-' + file.originalname);
//     },
// });
// exports.updateProductImg = multer({ storage: storageUpdateProduct });

// // ---- Hero slider images ----
// const storageHero = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//         cb(null, uniqueSuffix + '-' + file.originalname);
//     }
// });
// exports.uploadHeroImg = multer({ storage: storageHero });

// exports.uploadDir = uploadDir;
// exports.deleteFileIfExists = deleteFileIfExists;




// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const cloudinary = require("../config/cloudinary");

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,

//   params: {
//     folder: "nova-market/products",
//     allowed_formats: ["jpg", "jpeg", "png", "webp"],
//   },
// });

// const uploadProductImg = multer({
//   storage: storage,

//   limits: {
//     fileSize: 5 * 1024 * 1024,
//   },
// });

// module.exports = {
//   uploadProductImg,
// };