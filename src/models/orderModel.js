const mongoose = require('mongoose');
const { Schema } = mongoose;

const orderSchem = new Schema({
    user: {
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
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    tranId: {
        type: String,
        required: true,
        unique: true
    },


    //=================
    subTotal: { type: Number, default: 0 },
    deliveryCharge: { type: Number, default: 0 },
    deliveryArea: { type: String },            // "inside" | "outside"
    paymentMethod: { type: String },           // "cod" | "online"
    shipping: {                                // ager order e customer er address save hoy nai
        name: String,
        phone: String,
        email: String,
        address: String,
        city: String,
        postcode: String,
    },
}, { timestamps: true })



module.exports = mongoose.model('Order', orderSchem)