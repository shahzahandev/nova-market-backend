const multer = require('multer')


// <=== Create Product time image uploaders ===>
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/products')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

exports.upload = multer({ storage: storage })


// <=== Registration time image uploaders ===>
const storageUser = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/users')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + '-' + file.originalname)
  }
})

exports.uploadUser = multer({ storage: storageUser })