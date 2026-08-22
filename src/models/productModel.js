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
