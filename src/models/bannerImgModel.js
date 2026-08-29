// models/HeroSlider.js
const mongoose = require('mongoose');

const heroSliderSchema = new mongoose.Schema(
    {
        images: {
            type: [String], // filenames, e.g. "1699999999-123456789-photo.jpg"
            default: [],
            validate: {
                validator: function (arr) {
                    return arr.length <= 6;
                },
                message: 'Maximum 6 images allowed for hero slider.',
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('HeroSlider', heroSliderSchema);