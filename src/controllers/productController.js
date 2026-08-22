let Product = require('../models/productModel');
let Category = require('../models/categoryModels')
// exports.createProductController = async (req, res) => {
//     let { title, price, category } = req.body;

//     try {
//         // Empty fill message
//         if (!title || !price || !category) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'All required fields must be provided.'
//             });
//         }

//         // Access product
//         let existingProduct = await Product.findOne({ title });

//         // If product Or product title already avaiable
//         if (existingProduct) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Product already exist'
//             });
//         }

//         // Create random SKU
//         let sku = `${Date.now() + Math.random()}`;

//         // Saving proccess in MongoDB start
//         let product = new Product({
//             ...req.body,
//             sku: sku
//         });

//         await product.save();
//         // 
//         // success message
//         return res.status(201).json({
//             success: true,
//             message: 'Product created successfully.',
//             product: product
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error. Please try again later.",
//             error: error.message
//         });
//     }
// }

// exports.createProductController = async (req, res) => {
//     try {
//         const {
//             title,
//             price,
//             category,
//             stock,
//             tag,
//             specifications,
//             features,
//             discountType,
//             discountPrice,
//             discountStartDate,
//             discountEndDate,
//             isMain,
//             ...rest
//         } = req.body;

//         // ---- required fields ----
//         if (!title || !price || !category || !stock) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'All required fields must be provided.'
//             });
//         }

//         const numericPrice = Number(price);
//         const numericStock = Number(stock);
//         const numericDiscountPrice = Number(discountPrice) || 0;

//         if (numericStock < 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Stock cannot be negative.'
//             });
//         }

//         // ---- discount validation (only when a real discount type is set) ----
//         const hasDiscount = discountType && discountType !== 'none';

//         if (hasDiscount) {
//             if (!discountStartDate || !discountEndDate) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Discount start and end dates are required when a discount is set.'
//                 });
//             }

//             const startDate = new Date(discountStartDate).setHours(0, 0, 0, 0);
//             const endDate = new Date(discountEndDate).setHours(0, 0, 0, 0);
//             const currentDate = new Date().setHours(0, 0, 0, 0);

//             if (currentDate > startDate) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Discount start date can't be earlier than today."
//                 });
//             }
//             if (endDate < startDate) {
//                 return res.status(400).json({
//                     success: false,
//                     message: "Discount end date can't be earlier than the start date."
//                 });
//             }
//             if (numericDiscountPrice < 0) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Discount price cannot be negative.'
//                 });
//             }
//             if (discountType === 'flat' && numericDiscountPrice >= numericPrice) {
//                 return res.status(400).json({
//                     success: false,
//                     message: 'Discount price cannot be greater than or equal to the product price.'
//                 });
//             }
//         }

//         // ---- duplicate title check ----
//         const existingProduct = await Product.findOne({ title });
//         if (existingProduct) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Product already exist'
//             });
//         }

//         // ---- random sku ----
//         const sku = `${Date.now() + Math.random()}`;

//         // ---- images from multer (field name: "photos") ----
//         const mainIdx = Number(isMain);
//         const images = (req.files || []).map((file, index) => ({
//             url: `/upload/${file.filename}`,
//             isMain: mainIdx === index,
//         }));

//         // ---- parse fields that arrive as strings via FormData ----
//         let parsedTag = [];
//         if (tag) {
//             parsedTag = tag.split(',').map((t) => t.trim()).filter(Boolean);
//         }

//         let parsedFeatures = [];
//         if (features) {
//             parsedFeatures = features.split(',').map((f) => f.trim()).filter(Boolean);
//         }

//         let parsedSpecifications = [];
//         if (specifications) {
//             try {
//                 parsedSpecifications = JSON.parse(specifications);
//             } catch {
//                 parsedSpecifications = [];
//             }
//         }

//         // ---- build the document ----
//         const product = new Product({
//             ...rest,
//             title,
//             price: numericPrice,
//             stock: numericStock,
//             category,
//             sku,
//             images,
//             tag: parsedTag,
//             features: parsedFeatures,
//             specifications: parsedSpecifications,
//             discountType: discountType || 'none',
//             discountPrice: hasDiscount ? numericDiscountPrice : 0,
//             discountStartDate: hasDiscount ? discountStartDate : undefined,
//             discountEndDate: hasDiscount ? discountEndDate : undefined,
//         });

//         await product.save();

//         return res.status(201).json({
//             success: true,
//             message: 'Product created successfully.',
//             product: product
//         });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error. Please try again later.",
//             error: error.message
//         });
//     }
// }


// CREATE PRODUCT


exports.createProductController = async (req, res) => {
    try {
        const { title, description, shortDescription, price, discountType, discountPrice, discountStartDate, discountEndDate,
            stock, brand, category, subCategory, tag, additionalInfo, status, specifications, features, isMain,} = req.body;

        if ( !title || price === undefined || price === "" ||
            !category || stock === undefined || stock === "" ) {
            return res.status(400).json({
                success: false,
                message: "Title, price, category and stock are required.",
            });
        }
        // Convert numbers
        const numericPrice = Number(price);
        const numericStock = Number(stock);
        const numericDiscountPrice = Number(discountPrice) || 0;

        // Price validation
        if ( Number.isNaN(numericPrice) || numericPrice <= 0) {
            return res.status(400).json({
                success: false,
                message: "Price must be greater than 0.",
            });
        }

        // Stock validation
        if (Number.isNaN(numericStock) || numericStock < 0 ) {
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
        // Discount
        const hasDiscount = discountType && discountType !== "none";

        let finalDiscountPrice = 0;
        let finalDiscountStartDate;
        let finalDiscountEndDate;

        if (hasDiscount) {
            // Discount dates required
            if (!discountStartDate || !discountEndDate ) {
                return res.status(400).json({
                    success: false,
                    message:"Discount start and end dates are required when discount is enabled.",
                });
            }

            // Date conversion
            const startDate = new Date( discountStartDate );
            const endDate = new Date(discountEndDate );
            const currentDate = new Date();
            // Normalize date
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            currentDate.setHours(0, 0, 0, 0);

            // Start date cannot be before today
            if (startDate < currentDate) {
                return res.status(400).json({
                    success: false,
                    message: "Discount start date cannot be earlier than today.",
                });
            }

            // End date cannot be before start date
            if (endDate < startDate) {
                return res.status(400).json({
                    success: false,
                    message: "Discount end date cannot be earlier than start date.",
                });
            }
            // Discount price validation
            if (Number.isNaN(numericDiscountPrice) || numericDiscountPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message:"Discount price cannot be negative.",
                });
            }

            // Flat discount
            if (discountType === "flat") {

                if (numericDiscountPrice <= 0) {
                    return res.status(400).json({
                        success: false,
                        message: "Discount amount must be greater than 0.",
                    });
                }

                if ( numericDiscountPrice >= numericPrice) {
                    return res.status(400).json({
                        success: false,
                        message:"Discount price must be less than the original price.",
                    });
                }
                finalDiscountPrice = numericPrice - numericDiscountPrice;
            }


         // Percentage discount
         else if ( discountType === "percentage") {
                if ( numericDiscountPrice <= 0 ||numericDiscountPrice > 100) {
                    return res.status(400).json({
                        success: false,
                        message: "Percentage discount must be between 1 and 100.",
                    });
                }
                finalDiscountPrice =numericPrice - (numericPrice * numericDiscountPrice) / 100;

                // Prevent 0 price
                if (finalDiscountPrice <= 0) {
                    return res.status(400).json({
                        success: false,
                        message:"Discount cannot reduce the product price to 0.",
                    });
                }
            }

            // Unknown discount type
            else {
                return res.status(400).json({
                    success: false,
                    message:"Invalid discount type.",
                });
            }
            finalDiscountStartDate = discountStartDate;
            finalDiscountEndDate = discountEndDate;
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
                parsedTags = tag .split(",").map((item) =>
                        item.trim()
                    ) .filter(Boolean);
            }
        }
        // Parse Features
        let parsedFeatures = [];

        if (features) {
            try {
                parsedFeatures =typeof features === "string" ? JSON.parse(features) : features;
                if ( !Array.isArray( parsedFeatures)) {
                    parsedFeatures = [];
                }

                parsedFeatures = parsedFeatures.map((item) =>
                            String(item).trim()
                        ) .filter(Boolean);
            } catch (error) {
                // Fallback if comma separated
                parsedFeatures = features.split(",") .map((item) =>
                        item.trim()
                    ) .filter(Boolean);
            }
        }
        // Parse Specifications
        let parsedSpecifications = [];

        if (specifications) {
            try {
                parsedSpecifications = typeof specifications === "string" ? JSON.parse( specifications ) : specifications;
                if ( !Array.isArray( parsedSpecifications)) {
                    parsedSpecifications = [];
                }

                parsedSpecifications = parsedSpecifications.filter((spec) =>
                                spec && spec.name && spec.value).map((spec) => ({name: String( spec.name).trim(),
                            value: String(
                                spec.value
                            ).trim(),
                        }));

            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message:"Invalid specifications format.",
                });
            }
        }
        // Images
        const files = req.files || [];
        const mainIndex =Number.isInteger(Number(isMain)) ? Number(isMain) : 0;

        const images = files.map(
            (file, index) => ({
                url: `/upload/${file.filename}`,
                isMain: index === mainIndex,
            })
        );

        if ( images.length > 0 && !images.some((image) => image.isMain)) {
            images[0].isMain = true;
        }

       let sku = `${Date.now() + Math.random()}`;

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
            message:"Product created successfully.",
            product,
        });
    } catch (error) {
        console.log("Create product error:",error);
        return res.status(500).json({
            success: false,
            message:"Internal server error. Please try again later.",
            error: error.message,
        });
    }
};

exports.allProductController = async (req, res) => {
    try {
        let allProduct = await Product.find({}).limit(10);

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

exports.singleProductController = async (req, res) => {
    let {id} = req.params

    try {
        let singleProductData = await Product.findOne({ _id : id });

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
    let { id } = req.body
    try {
        let deleteProductData = await Product.findByIdAndDelete(id);

        if (!id) {
            return res.status(404).json({
                success: false,
                message: 'Product Not Found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully.'
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

exports.updateProductController = async (req, res) => {
    let { id } = req.params;

    try {
        let updateProduct = await Product.findByIdAndUpdate({ _id: id }, req.body, { new: true });

        if (!updateProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product Not Found.'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Product update successfully.',
            updateProduct
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error.",
            error: error.message
        });
    }
}

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


        if(existingCategory){
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