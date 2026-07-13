const mongoose = require('mongoose')
const {Schema} = mongoose

let productSchema = new Schema({
    title:{
        type: String,
        unique: true,
        required: true
    },
    description:{
        type: String,
    },
    shortDescription:{
        type: String,
    },
    price:{
        type: Number,
        required: true,
    },
    discountPrice:{
        type: Number,
        min: 0,
        default: 0
    },
    sku:{
       type: String,
       required: true,
       unique: true, 
    },
    stock:{
        type: Number,
        min: 0,
        default: 0
    },
    brand:{
        type: String
    },
    category:{
        type: String,
        required: true
    },
    subCategory:{
        type: String,
    },
    tag:[
        {
            type: String,
        }
    ],
    additionalInfo:{
        type: String
    },
    status:{
        type: String,
        enum: ['pending', 'active', 'inactive'],
        default: 'pending'
    },
    images:[
        {
            url:{
                type: String,
                isMain:{
                    type: Boolean,
                    default: false
                },
            }
        }
    ]
}, {timestamps: true})

module.exports = mongoose.model('Product', productSchema)