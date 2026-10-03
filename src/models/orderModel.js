const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchem = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
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
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    tranId: {
        type: String,
        required: true,
        unique: true
    },
    stockDeducted: { type: Boolean, default: false },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "cancelled"] }, // default dibe na


    //=================
    subTotal: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    deliveryArea: { type: String },
    paymentMethod: { type: String },
    shipping: {
        name: String,
        phone: String,
        email: String,
        address: String,
        city: String,
        postcode: String,
    },
    deliveredAt: {
        type: Date,
        default: null
    },

}, { timestamps: true })



module.exports = mongoose.model('Order', orderSchem)