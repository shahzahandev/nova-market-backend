let Product = require('../models/productModel');
let Category = require('../models/categoryModels')
const mongoose = require('mongoose')
const fs = require('fs');
const path = require('path');



exports.createProductController = async (req, res) => {
    try {
        const { title,
            description,
            shortDescription,
            price,
            discountType,
            discountValue,
            discountStartDate,
            discountEndDate,
            stock,
            brand,
            category,
            subCategory,
            tag,
            additionalInfo,
            status,
            specifications,
            features,
            isMain, } = req.body;

        if (!title || price === undefined || price === "" ||
            !category || stock === undefined || stock === "") {
            return res.status(400).json({
                success: false,
                message: "Title, price, category and stock are required.",
            });
        }
        // Convert numbers
        const numericPrice = Number(price);
        const numericStock = Number(stock);
        const numericDiscountValue = Number(discountValue) || 0;
        // Price validation
        if (Number.isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than 0.",
            });
        }

        // Stock validation
        if (Number.isNaN(numericStock) || numericStock < 0) {
            return res.status(400).json({
                success: false,
                message: "Stock cannot be negative.",
            });
        }

        // Duplicate title check
        const existingProduct = await Product.findOne({
            title: title.trim(),
        });

        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: "Product already exists.",
            });
        }
        // ---------------------------------
        // Discount
        // ---------------------------------

        const hasDiscount = discountType && discountType !== "none";

        let finalDiscountPrice = numericPrice;
        let finalDiscountStartDate;
        let finalDiscountEndDate;

        if (hasDiscount) {

            // Discount dates required
            if (!discountStartDate || !discountEndDate) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Discount start and end dates are required when discount is enabled.",
                });
            }

            // Date conversion
            const startDate = new Date(discountStartDate);
            const endDate = new Date(discountEndDate);
            const currentDate = new Date();

            // Normalize date
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);

            // Invalid date check
            if (
                Number.isNaN(startDate.getTime()) ||
                Number.isNaN(endDate.getTime())
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid discount date.",
                });
            }

            // Start date cannot be before today
            if (startDate < currentDate) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Discount start date cannot be earlier than today.",
                });
            }

            // End date cannot be before start date
            if (endDate < startDate) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Discount end date cannot be earlier than start date.",
                });
            }

            // Discount value validation
            if (
                Number.isNaN(numericDiscountValue) ||
                numericDiscountValue <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Discount value must be greater than 0.",
                });
            }

            // ---------------------------------
            // Flat Discount
            // ---------------------------------

            if (discountType === "flat") {

                if (numericDiscountValue >= numericPrice) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Discount amount must be less than the original price.",
                    });
                }

                finalDiscountPrice =
                    numericPrice - numericDiscountValue;
            }

            // ---------------------------------
            // Percentage Discount
            // ---------------------------------

            else if (discountType === "percentage") {

                if (
                    numericDiscountValue <= 0 ||
                    numericDiscountValue > 100
                ) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Percentage discount must be between 1 and 100.",
                    });
                }

                finalDiscountPrice =
                    numericPrice -
                    (numericPrice * numericDiscountValue) / 100;

                // Prevent zero/negative price
                if (finalDiscountPrice <= 0) {
                    return res.status(400).json({
                        success: false,
                        message:
                            "Discount cannot reduce the product price to 0.",
                    });
                }
            }

            // ---------------------------------
            // Invalid Discount Type
            // ---------------------------------

            else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid discount type.",
                });
            }

            finalDiscountStartDate = startDate;
            finalDiscountEndDate = endDate;
        }
        // Parse Tags
        let parsedTags = [];

        if (tag) {
            try {
                // Frontend JSON.stringify()
                parsedTags = typeof tag === "string" ? JSON.parse(tag) : tag;

                if (!Array.isArray(parsedTags)) {
                    parsedTags = [];
                }

                parsedTags = parsedTags.map((item) =>
                    String(item).trim()
                ).filter(Boolean);
            } catch (error) {
                // Fallback if comma separated string
                parsedTags = tag.split(",").map((item) =>
                    item.trim()
                ).filter(Boolean);
            }
        }
        // Parse Features
        let parsedFeatures = [];

        if (features) {
            try {
                parsedFeatures = typeof features === "string" ? JSON.parse(features) : features;
                if (!Array.isArray(parsedFeatures)) {
                    parsedFeatures = [];
                }

                parsedFeatures = parsedFeatures.map((item) =>
                    String(item).trim()
                ).filter(Boolean);
            } catch (error) {
                // Fallback if comma separated
                parsedFeatures = features.split(",").map((item) =>
                    item.trim()
                ).filter(Boolean);
            }
        }
        // Parse Specifications
        let parsedSpecifications = [];

        if (specifications) {
            try {
                parsedSpecifications = typeof specifications === "string" ? JSON.parse(specifications) : specifications;
                if (!Array.isArray(parsedSpecifications)) {
                    parsedSpecifications = [];
                }

                parsedSpecifications = parsedSpecifications.filter((spec) =>
                    spec && spec.name && spec.value).map((spec) => ({
                        name: String(spec.name).trim(),
                        value: String(
                            spec.value
                        ).trim(),
                    }));

            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid specifications format.",
                });
            }
        }
        // Images
        const files = req.files || [];
        const mainIndex = Number.isInteger(Number(isMain)) ? Number(isMain) : 0;

        const images = files.map(
            (file, index) => ({
                url: `/upload/${file.filename}`,
                isMain: index === mainIndex,
            })
        );

        if (images.length > 0 && !images.some((image) => image.isMain)) {
            images[0].isMain = true;
        }

        const titlePrefix = title
            .trim()
            .replace(/[^a-zA-Z]/g, "")
            .slice(0, 3)
            .toUpperCase();

        const currentDate = new Date();

        const day = String(currentDate.getDate()).padStart(2, "0");
        const month = String(currentDate.getMonth() + 1).padStart(2, "0");
        const year = currentDate.getFullYear();

        const baseSku = `${titlePrefix}${day}${month}${year}`;

        let sku;
        let isDuplicate = true;

        // যতক্ষণ duplicate SKU পাওয়া যাবে,
        // ততক্ষণ নতুন 3 digit number generate করবে
        while (isDuplicate) {
            const randomNumber = Math.floor(
                100 + Math.random() * 900
            );

            sku = `${baseSku}${randomNumber}`;

            const existingSku = await Product.findOne({ sku });

            if (!existingSku) {
                isDuplicate = false;
            }
        }

        // SKU Duplicate Check
        const existingSku = await Product.findOne({ sku });

        if (existingSku) {
            return res.status(400).json({
                success: false,
                message: "A product with this SKU already exists. Please use a different product title.",
            });
        }

        const product = new Product({
            title: title.trim(),
            description: description?.trim() || "",
            shortDescription: shortDescription?.trim() || "",
            price: numericPrice,
            discountType: hasDiscount ? discountType : "none",
            discountPrice: hasDiscount ? finalDiscountPrice : 0,
            discountStartDate: hasDiscount ? finalDiscountStartDate : undefined,
            discountEndDate: hasDiscount ? finalDiscountEndDate : undefined,
            stock: numericStock,
            brand: brand?.trim() || "",
            category: category.trim(),
            subCategory: subCategory?.trim() || "",
            tag: parsedTags,
            features: parsedFeatures,
            specifications: parsedSpecifications,
            additionalInfo: additionalInfo?.trim() || "",
            status: status || "active",
            images,
            sku: sku
        });
        await product.save();

        return res.status(201).json({
            success: true,
            message: "Product created successfully.",
            product,
        });
    } catch (error) {
        console.log("Create product error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message,
        });
    }
};

exports.allProductController = async (req, res) => {
    try {
        let allProduct = await Product.find({});

        return res.status(200).json({
            success: true,
            message: 'Fetchin all product',
            allProduct: allProduct
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message
        });
    }
}

exports.allActiveAndDiscountProduct = async (req, res) => {
    try {
        const currentDate = new Date();
        const products = await Product.find({
            $and: [
                { status: "active" },
                { discountStartDate: { $lte: currentDate } },
                { discountEndDate: { $gte: currentDate } }
            ]
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: 'Fetching active and dicount products successfully',
            products
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

exports.allActiveProduct = async (req, res) => {
    try {
        const products = await Product.find({ status: 'active' })
            .sort({ createdAt: -1 })

        return res.status(200).json({
            success: true,
            message: 'Fetching all products successfully',
            products
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

exports.singleProductController = async (req, res) => {
    let { id } = req.params

    try {
        let singleProductData = await Product.findOne({ _id: id });

        if (!id) {
            return res.status(404).json({
                success: false,
                message: 'Product Not Found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: `Product details.`,
            data: singleProductData
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message
        });
    }
}

exports.deleteProductController = async (req, res) => {
    const { id } = req.params;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID',
            });
        }

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found',
            });
        }

        // Best-effort cleanup: remove the product's uploaded image files.
        // A missing file (already deleted, moved, etc.) never fails the request.
        (deletedProduct.images || []).forEach((image) => {
            if (!image.url) return;
            const filePath = path.join(__dirname, '../upload', path.basename(image.url));
            fs.unlink(filePath, (err) => {
                if (err) console.log('Could not delete image file:', filePath, err.message);
            });
        });

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully.',
            product: deletedProduct,
        });

    } catch (error) {
        console.log('Delete Product Error:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            error: error.message,
        });
    }
};

exports.updateProductController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
        }
        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
            });
        }
        if (req.body.title !== undefined) {
            product.title = req.body.title;
        }

        if (req.body.description !== undefined) {
            product.description = req.body.description;
        }

        if (req.body.shortDescription !== undefined) {
            product.shortDescription = req.body.shortDescription;
        }

        if (req.body.price !== undefined) {
            product.price = Number(req.body.price);
        }

        if (req.body.stock !== undefined) {
            product.stock = Number(req.body.stock);
        }

        if (req.body.brand !== undefined) {
            product.brand = req.body.brand;
        }

        if (req.body.category !== undefined) {
            product.category = req.body.category;
        }

        if (req.body.subCategory !== undefined) {
            product.subCategory = req.body.subCategory;
        }

        if (req.body.additionalInfo !== undefined) {
            product.additionalInfo = req.body.additionalInfo;
        }

        if (req.body.status !== undefined) {
            product.status = req.body.status;
        }
        if (req.body.discountType !== undefined) {
            product.discountType = req.body.discountType;
        }

        if (req.body.discountPrice !== undefined) {
            product.discountPrice =
                req.body.discountPrice === ""
                    ? 0
                    : Number(req.body.discountPrice);
        }

        if (req.body.discountStartDate !== undefined) {
            product.discountStartDate =
                req.body.discountStartDate === ""
                    ? null
                    : new Date(req.body.discountStartDate);
        }

        if (req.body.discountEndDate !== undefined) {
            product.discountEndDate =
                req.body.discountEndDate === ""
                    ? null
                    : new Date(req.body.discountEndDate);
        }

        if (req.body.tag !== undefined) {
            if (Array.isArray(req.body.tag)) {
                product.tag = req.body.tag
                    .map((tag) => String(tag).trim())
                    .filter(Boolean);
            } else {
                product.tag = String(req.body.tag)
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean);
            }
        }

        if (req.body.specifications !== undefined) {
            try {
                let specifications = req.body.specifications;

                if (typeof specifications === "string") {
                    specifications = JSON.parse(specifications);
                }

                if (!Array.isArray(specifications)) {
                    return res.status(400).json({
                        success: false,
                        message: "Specifications must be an array",
                    });
                }

                product.specifications = specifications;
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid specifications format",
                });
            }
        }

        if (req.body.features !== undefined) {
            try {
                let features = req.body.features;

                if (typeof features === "string") {
                    features = JSON.parse(features);
                }

                if (!Array.isArray(features)) {
                    return res.status(400).json({
                        success: false,
                        message: "Features must be an array",
                    });
                }

                product.features = features
                    .map((feature) => String(feature).trim())
                    .filter(Boolean);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid features format",
                });
            }
        }

        const oldImages = product.images.map((image) => ({
            _id: image._id?.toString(),
            url: image.url,
            isMain: image.isMain,
        }));

        let existingImages = [];

        if (req.body.existingImages !== undefined) {
            try {
                existingImages =
                    typeof req.body.existingImages === "string"
                        ? JSON.parse(req.body.existingImages)
                        : req.body.existingImages;

                if (!Array.isArray(existingImages)) {
                    return res.status(400).json({
                        success: false,
                        message: "existingImages must be an array",
                    });
                }
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid existingImages format",
                });
            }
        } else {
            existingImages = oldImages;
        }

        const existingImageUrls = new Set(
            existingImages
                .map((image) => image.url)
                .filter(Boolean)
        );

        const removedImages = oldImages.filter(
            (oldImage) =>
                oldImage.url &&
                !existingImageUrls.has(oldImage.url)
        );

        for (const image of removedImages) {
            try {
                const relativePath = image.url.startsWith("/")
                    ? image.url.substring(1)
                    : image.url;

                const filePath = path.join(
                    __dirname,
                    "..",
                    relativePath
                );

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log("Deleted old image:", filePath);
                }
            } catch (deleteError) {
                console.error("Failed to delete old image:", image.url, deleteError.message);
            }
        }
        let uploadedImages = [];

        if (req.files && req.files.length > 0) {
            uploadedImages = req.files.map((file) => ({
                url: `/upload/${file.filename}`,
                isMain: false,
            }));
        }
        const allImages = [
            ...existingImages,
            ...uploadedImages,
        ];

        const newMainIndex =
            req.body.newMainIndex !== undefined
                ? Number(req.body.newMainIndex)
                : -1;

        if (newMainIndex >= 0) {
            allImages.forEach((image) => {
                image.isMain = false;
            });

            const realIndex =
                existingImages.length + newMainIndex;

            if (allImages[realIndex]) {
                allImages[realIndex].isMain = true;
            }
        } else {
            const hasMainImage = allImages.some(
                (image) => image.isMain === true
            );
            if (!hasMainImage && allImages.length > 0) {
                allImages[0].isMain = true;
            }
        }

        product.images = allImages;

        await product.save();
        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product,
            removedImages: removedImages.map((image) => image.url),
        });

    } catch (error) {
        console.error(
            "Update Product Error:", error
        );
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "Product title or SKU already exists",
                error: error.message,
            });
        }
        if (error.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: "Validation error",
                error: error.message,
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message,
        });
    }
};




// Category ===============
exports.createCategoryController = async (req, res) => {
    const { name } = req.body
    try {

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Category name is requred'
            });
        }

        const normalizedName = name.trim().toLowerCase();

        const existingCategory = await Category.findOne({
            name: normalizedName
        });


        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: 'This Catagorey already exists'
            })
        }


        let category = new Category({
            name: normalizedName
        })
        await category.save();

        return res.status(201).json({
            success: true,
            messege: 'Category created',
            category
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}

exports.getAllCategoryController = async (req, res) => {
    try {
        const allCategory = await Category.find({});

        return res.status(200).json({
            success: true,
            message: 'Fetching all categoryes',
            allCategory
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
}