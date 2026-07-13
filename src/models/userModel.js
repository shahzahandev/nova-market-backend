const mongoose = require('mongoose')
const suceMiddleWare = require('../middleWare/suceMiddleWare')
const { Schema } = mongoose

let userModelSchema = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minLength: 8,
        select: true,
        // match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, 'Please enter a stronger password'],
    },
    phoneNumber: {
        type: String,
        unique: true,
        sparse: true,
    },
    terms: {
        type: Boolean
    },
    profile: {
        type: String
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'editor', 'vendor'],
        default: 'user'
    },
    isHold: {
        type: Boolean,
        default: false
    },
    isVerified: {
        type: Boolean,
        default: false

    },

    billingAddress: {
        firstName: {
            type: String
        },
        lastName: {
            type: String
        },
        email: {
            type: String
        },
        companyName: {
            type: String
        },
        street: {
            type: String
        },
        state: {
            type: String
        },
        zipCode: {
            type: String
        },
        phoneNumber: {
            type: String
        },
        country: {
            type: String
        },
    }
})

module.exports = mongoose.model("User", userModelSchema)