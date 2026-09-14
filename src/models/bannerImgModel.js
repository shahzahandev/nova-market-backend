const mongoose = require("mongoose");

const heroSliderSchema = new mongoose.Schema(
  {
    images: {
      type: [
        {
          url: {
            type: String,
            required: true,
          },
          public_id: {
            type: String,
            required: true,
          },
        },
      ],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 6;
        },
        message: "Maximum 6 images allowed for hero slider.",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HeroSlider", heroSliderSchema);