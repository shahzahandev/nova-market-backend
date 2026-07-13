const mongoose = require('mongoose');
const {Schema} = mongoose;

const orderSchem = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
              title: String,
              price: Number,
              discountPrice: Number,
              sku: String,
              stock: String,
              category: String,
              tag: Array,
              status: String,
              quantity: Number,
              totalPrice: Number
    }],
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'reject', 'approved'],
        default: 'pending'
    },
    tranId: {
        type: String,
        required: true,
        unique: true
    }
}, {timestamps: true})



module.exports = mongoose.model('Order', orderSchem)