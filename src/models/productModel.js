const mongoose = require('mongoose')
const {Schema} = mongoose

let productSchema = new Schema({
    title: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String,
    },
    shortDescription: {
        type: String,
    },
    discountType: {
        type: String
    },
    price: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number,
        min: 0,
        default: 0
    },
    discountStartDate: {
        type: Date
    },
    discountEndDate: {
        type: Date
    },
    sku: {
        type: String,
           required: true,
           unique: true, 
    },
    stock: {
        type: Number,
        min: 0,
        required:  true
    },
    brand: {
        type: String
    },
    category: {
        type: String,
        required: true
    },
    subCategory: {
        type: String,
    },
    tag: [
        {
            type: String,
        }
    ],
    additionalInfo: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'inactive'],
        default: 'active'
    },
    images: [
        {
            url: {
                type: String,
            },
            isMain: {
                type: Boolean,
                default: false
            },
        }
    ],
    specifications: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        value: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    features: [
      {
        type: String,
        trim: true,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
     reviewCount: {
      type: Number,
      default: 0,
    },
}, {timestamps: true})

module.exports = mongoose.model('Product', productSchema)



// {
   
//   "title": "SmartWatch",
//   "brand": "Sony",
//   "description": "Sony SmartWatch 3 powered by Android Wear with notifications, voice commands, GPS and multiple sensors. It features a 1.6-inch transflective display, Bluetooth connectivity, 4 GB storage and up to 2 days of battery life.",
//   "shortDescription": "voice commands, GPS and multiple sensors. It features a 1.6-inch transflective display, Bluetooth connectivity, 4 GB storage and up to 2 days of battery life",
//   "category": "moblie",
//   "images": [
//     {
//       "url": "https://example.com/images/sony-swr50-main.jpg",
//       "isMain": true
//     },
//     {
//       "url": "https://example.com/images/sony-swr50-front.jpg",
//       "isMain": false
//     },
//     {
//       "url": "https://example.com/images/sony-swr50-side.jpg",
//       "isMain": false
//     }
//   ],
//   "video": {
//     "url": "https://example.com/videos/sony-swr50.mp4",
//     "thumbnail": "https://example.com/images/sony-swr50-thumbnail.jpg"
//   },
//   "price": 199,
//   "discountPrice": 144,
//   "discountStartDate": "2026-08-21T00:00:00.000Z",
//   "discountEndDate": "2026-08-31T23:59:59.000Z",
//   "stock": 25,
//   "sku": "SONY-SWR50-BLACK",
//   "specifications": [
//     {
//       "name": "Operating System",
//       "value": "Android"
//     },
//     {
//       "name": "Memory Storage Capacity",
//       "value": "4 GB"
//     },
//     {
//       "name": "Special Feature",
//       "value": "Microphone"
//     },
//     {
//       "name": "Connectivity Technology",
//       "value": "USB"
//     },
//     {
//       "name": "Wireless Communication Standard",
//       "value": "Bluetooth"
//     },
//     {
//       "name": "Battery Cell Composition",
//       "value": "Lithium"
//     },
//     {
//       "name": "GPS",
//       "value": "GPS Via Smartphone"
//     },
//     {
//       "name": "Shape",
//       "value": "Rectangular"
//     },
//     {
//       "name": "Screen Size",
//       "value": "1.6 inches"
//     },
//     {
//       "name": "Water Resistance",
//       "value": "IP68 Rated"
//     },
//     {
//       "name": "Battery Life",
//       "value": "Up to 2 days"
//     }
//   ],
//   "features": [
//     "Black Classic Band",
//     "Water Protected",
//     "IP68 Rated",
//     "Up to 2 days battery life",
//     "Ambient light sensor",
//     "Accelerometer",
//     "Compass",
//     "Gyro",
//     "GPS",
//     "Notifications",
//     "Voice Commands",
//     "Lifelog",
//     "Powered by Android Wear",
//     "Useful information when you need it",
//     "Expandable Android Wear experience"
//   ],
//   "rating": 4.7,
//   "reviewCount": 386,
//   "isActive": true

// }