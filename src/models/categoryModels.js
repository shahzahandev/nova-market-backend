const mongoose = require('mongoose');
const {Schema} = mongoose;


const categorySchema = new Schema ({
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'hold'],
        default: 'active'
    }
}, {timestamps: true})


module.exports = mongoose.model('Category', categorySchema);