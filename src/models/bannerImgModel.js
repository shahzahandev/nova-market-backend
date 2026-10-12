const mongoose = require("mongoose");

const heroSliderSchema = new mongoose.Schema(
  {
    // 1. Eyebrow text (e.g. "New season, new drops")
    eyebrow: {
      type: String,
      trim: true,
      default: "",
    },

    // 2. Heading (duita part)
    headingFirst: {
      type: String, // white color e dekhabe
      trim: true,
      default: "",
    },
    headingSecond: {
      type: String, // text-brand-600 color e dekhabe
      trim: true,
      default: "",
    },

    // 3. Paragraph
    paragraph: {
      type: String,
      trim: true,
      default: "",
    },

    // 4. Button text
    buttonText: {
      type: String,
      trim: true,
      default: "",
    },

    images: {
      type: [
        {
          url: { type: String, required: true },
          public_id: { type: String, required: true },
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
  { timestamps: true }
);

module.exports = mongoose.model("HeroSlider", heroSliderSchema);