// controllers/heroSliderController.js
const path = require('path');
const fs = require('fs');
const HeroSlider = require('../models/bannerImgModel');

const uploadDir = path.join(__dirname, '../upload');

const deleteFileIfExists = (filename) => {
    const filePath = path.join(uploadDir, filename);
    fs.unlink(filePath, (err) => {
        if (err && err.code !== 'ENOENT') {
            console.error('File delete error:', err.message);
        }
    });
};

// POST /api/heroSlider  (create + update, same endpoint)
exports.upsertHeroSliderController = async (req, res) => {
    try {
        let hero = await HeroSlider.findOne();

        // body theke asa removeImages (JSON string ba array — frontend theke jeভাবে pathabe)
        let removeImages = req.body.removeImages || [];
        if (typeof removeImages === 'string') {
            try {
                removeImages = JSON.parse(removeImages);
            } catch {
                removeImages = [removeImages];
            }
        }

        const newFilenames = (req.files || []).map((file) => file.filename);

        if (!hero) {
            // ---- CREATE ----
            if (newFilenames.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one image is required.',
                });
            }
            if (newFilenames.length > 6) {
                newFilenames.forEach(deleteFileIfExists);
                return res.status(400).json({
                    success: false,
                    message: 'Maximum 6 images allowed.',
                });
            }

            hero = await HeroSlider.create({ images: newFilenames });

            return res.status(201).json({
                success: true,
                message: 'Hero slider created successfully.',
                data: hero,
            });
        }

        // ---- UPDATE ----
        let currentImages = hero.images.filter(
            (img) => !removeImages.includes(img)
        );

        // remove-e mark kora image gulo disk theke delete
        removeImages.forEach((img) => {
            if (hero.images.includes(img)) deleteFileIfExists(img);
        });

        const finalImages = [...currentImages, ...newFilenames];

        if (finalImages.length > 6) {
            newFilenames.forEach(deleteFileIfExists);
            return res.status(400).json({
                success: false,
                message: `Maximum 6 images allowed. You currently have ${currentImages.length}, tried to add ${newFilenames.length}.`,
            });
        }

        if (finalImages.length === 0) {
            newFilenames.forEach(deleteFileIfExists);
            return res.status(400).json({
                success: false,
                message: 'At least one image must remain in the hero slider.',
            });
        }

        hero.images = finalImages;
        await hero.save();

        return res.status(200).json({
            success: true,
            message: 'Hero slider updated successfully.',
            data: hero,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Something went wrong.',
            error: error.message,
        });
    }
};

// GET /api/heroSlider  (frontend-e cube slider load korar jonno)
exports.getHeroSliderController = async (req, res) => {
    try {
        const hero = await HeroSlider.findOne();
        return res.status(200).json({
            success: true,
            data: hero || { images: [] },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong.',
            error: error.message,
        });
    }
};