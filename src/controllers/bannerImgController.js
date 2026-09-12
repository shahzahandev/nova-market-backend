let HeroSlider = require('../models/bannerImgModel');
const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '../upload');

const MAX_IMAGES = 6;

const deleteFileIfExists = (filename) => {
    if (!filename) return;

    const filePath = path.join(uploadDir, filename);

    fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.log('File delete error:', err.message);
        }
    });
};

// =====================================================
// Create + Update Hero Slider (same endpoint)
// =====================================================

exports.upsertHeroSliderController = async (req, res) => {
    try {
        let hero = await HeroSlider.findOne();

        // Parse removeImages
        // Frontend JSON.stringify() kore pathay, tai proyojon onujayi parse
        let removeImages = req.body.removeImages;

        if (removeImages) {
            try {
                removeImages = typeof removeImages === "string" ? JSON.parse(removeImages) : removeImages;

                if (!Array.isArray(removeImages)) {
                    removeImages = [removeImages];
                }
            } catch (error) {
                // Fallback if comma separated string
                removeImages = String(removeImages).split(",").map((item) =>
                    item.trim()
                ).filter(Boolean);
            }
        } else {
            removeImages = [];
        }

        // Images
        const files = req.files || [];
        const newFilenames = files.map((file) => file.filename);

        // ---------------------------------
        // Create
        // ---------------------------------

        if (!hero) {

            if (newFilenames.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one image is required.",
                });
            }

            if (newFilenames.length > MAX_IMAGES) {
                newFilenames.forEach(deleteFileIfExists);

                return res.status(400).json({
                    success: false,
                    message: `Maximum ${MAX_IMAGES} images allowed.`,
                });
            }

            hero = new HeroSlider({
                images: newFilenames,
            });

            await hero.save();

            return res.status(201).json({
                success: true,
                message: "Hero slider created successfully.",
                data: hero,
            });
        }

        // ---------------------------------
        // Update
        // ---------------------------------

        // Step 1: shudhu compute koro, kono file disk theke delete koro na ekhono
        const currentImages = hero.images.filter((image) =>
            !removeImages.includes(image)
        );

        const finalImages = [...currentImages, ...newFilenames];

        // Step 2: shob validation age sesh koro, file touch korar age
        if (finalImages.length > MAX_IMAGES) {
            newFilenames.forEach(deleteFileIfExists);

            return res.status(400).json({
                success: false,
                message: `Maximum ${MAX_IMAGES} images allowed. You currently have ${currentImages.length}, tried to add ${newFilenames.length}.`,
            });
        }

        if (finalImages.length === 0) {
            newFilenames.forEach(deleteFileIfExists);

            return res.status(400).json({
                success: false,
                message: "At least one image must remain in the hero slider.",
            });
        }

        // Step 3: validation pass korle tokhon actual removeImages gulo disk theke delete koro
        removeImages.forEach((image) => {
            if (hero.images.includes(image)) {
                deleteFileIfExists(image);
            }
        });

        // Step 4: DB update
        hero.images = finalImages;
        await hero.save();

        return res.status(200).json({
            success: true,
            message: "Hero slider updated successfully.",
            data: hero,
        });

    } catch (error) {
        console.log("Hero slider save error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message,
        });
    }
};

// =====================================================
// Get Hero Slider
// =====================================================

exports.getHeroSliderController = async (req, res) => {
    try {
        const hero = await HeroSlider.findOne();

        return res.status(200).json({
            success: true,
            data: hero || { images: [] },
        });

    } catch (error) {
        console.log("Get hero slider error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message,
        });
    }
};
