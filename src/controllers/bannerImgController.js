const HeroSlider = require("../models/bannerImgModel");

const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../helpers/cloudinaryHelper");

const MAX_IMAGES = 6;

const TEXT_FIELDS = [
  "eyebrow",
  "headingFirst",
  "headingSecond",
  "paragraph",
  "buttonText",
];

// req.body theke sudhu pathano text field gulo nibe
const pickTextFields = (body) => {
  const data = {};
  for (const field of TEXT_FIELDS) {
    if (body[field] !== undefined) {
      data[field] = String(body[field]).trim();
    }
  }
  return data;
};

exports.upsertHeroSliderController = async (req, res) => {
  let uploadedNewImages = [];

  try {
    let hero = await HeroSlider.findOne();

    const textData = pickTextFields(req.body);

    // -----------------------------
    // Parse removeImages
    // -----------------------------
    let removeImages = req.body.removeImages;

    if (removeImages) {
      try {
        removeImages =
          typeof removeImages === "string"
            ? JSON.parse(removeImages)
            : removeImages;

        if (!Array.isArray(removeImages)) {
          removeImages = [removeImages];
        }
      } catch (error) {
        removeImages = String(removeImages)
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } else {
      removeImages = [];
    }

    // -----------------------------
    // Uploaded files
    // -----------------------------
    const files = Array.isArray(req.files) ? req.files : [];

    if (files.length > MAX_IMAGES) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_IMAGES} images allowed.`,
      });
    }

    // =====================================================
    // CREATE
    // =====================================================
    if (!hero) {
      if (files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "At least one image is required.",
        });
      }

      for (const file of files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "ecobazar/banners"
        );

        uploadedNewImages.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }

      hero = new HeroSlider({
        ...textData,
        images: uploadedNewImages,
      });

      try {
        await hero.save();
      } catch (saveError) {
        for (const image of uploadedNewImages) {
          await deleteFromCloudinary(image.public_id);
        }
        throw saveError;
      }

      return res.status(201).json({
        success: true,
        message: "Hero slider created successfully.",
        data: hero,
      });
    }

    // =====================================================
    // UPDATE
    // =====================================================
    const currentImages = hero.images.filter(
      (image) => !removeImages.includes(image.public_id)
    );

    // Upload new images
    for (const file of files) {
      const result = await uploadToCloudinary(
        file.buffer,
        "ecobazar/banners"
      );

      uploadedNewImages.push({
        url: result.secure_url,
        public_id: result.public_id,
      });
    }

    const finalImages = [...currentImages, ...uploadedNewImages];

    // Maximum validation
    if (finalImages.length > MAX_IMAGES) {
      for (const image of uploadedNewImages) {
        await deleteFromCloudinary(image.public_id);
      }

      return res.status(400).json({
        success: false,
        message: `Maximum ${MAX_IMAGES} images allowed. You currently have ${currentImages.length}, tried to add ${files.length}.`,
      });
    }

    // At least one image
    if (finalImages.length === 0) {
      for (const image of uploadedNewImages) {
        await deleteFromCloudinary(image.public_id);
      }

      return res.status(400).json({
        success: false,
        message: "At least one image must remain in the hero slider.",
      });
    }

    // Find removed images
    const removedImages = hero.images.filter((image) =>
      removeImages.includes(image.public_id)
    );

    // Text + images update
    Object.assign(hero, textData);
    hero.images = finalImages;

    await hero.save();

    // Delete removed Cloudinary images
    for (const image of removedImages) {
      try {
        await deleteFromCloudinary(image.public_id);
        console.log("Deleted Cloudinary banner:", image.public_id);
      } catch (deleteError) {
        console.error(
          "Failed to delete banner:",
          image.public_id,
          deleteError.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Hero slider updated successfully.",
      data: hero,
    });
  } catch (error) {
    console.error("Hero Slider Error:", error);

    // Cleanup newly uploaded images
    for (const image of uploadedNewImages) {
      try {
        await deleteFromCloudinary(image.public_id);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup failed:", cleanupError.message);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.getHeroSliderController = async (req, res) => {
  try {
    const hero = await HeroSlider.findOne();

    return res.status(200).json({
      success: true,
      data: hero || {
        eyebrow: "",
        headingFirst: "",
        headingSecond: "",
        paragraph: "",
        buttonText: "",
        images: [],
      },
    });
  } catch (error) {
    console.error("Get Hero Slider Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};