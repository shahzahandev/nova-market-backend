const Product = require("../models/productModel");
const Category = require("../models/categoryModels");
const mongoose = require("mongoose");
const { uploadToCloudinary, deleteFromCloudinary, } = require("../helpers/cloudinaryHelper");




exports.createProductController = async (req, res) => {
  let uploadedImages = [];
  
  try {
    const {
      title,
      description,
      shortDescription,
      price,
      stock,
      brand,
      category,
      subCategory,
      additionalInfo,
      status,
      section,      
      discountType,
      discountPrice,
      discountStartDate,
      discountEndDate,
    } = req.body;

    // Validation
    if (!title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product title is required.",
      });
    }

    if (price === undefined || price === "") {
      return res.status(400).json({
        success: false,
        message: "Product price is required.",
      });
    }

    if (!category?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product category is required.",
      });
    }

    const allowedSections = ["none", "new", "deals", "feature"];
    const productSection = section?.trim() || "none";

    if (!allowedSections.includes(productSection)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section. Allowed: none, new, deals, feature.",
      });
    }

    // Validate Price
    const parsedPrice = Number(price);
    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        success: false,
        message: "Product price must be a valid number.",
      });
    }

    // Parse Arrays
    let tags = [];
    let features = [];
    let specifications = [];

    // TAG PARSER
    if (req.body.tag) {
      try {
        if (Array.isArray(req.body.tag)) {
          tags = req.body.tag;
        } else if (typeof req.body.tag === "string") {
          const trimmedTag = req.body.tag.trim();

          // JSON array হলে
          if (trimmedTag.startsWith("[")) {
            const parsedTags = JSON.parse(trimmedTag);

            tags = Array.isArray(parsedTags) ? parsedTags : [];
          } else {
            // comma separated হলে
            tags = trimmedTag
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean);
          }
        }
      } catch (error) {
        console.error("Tag parse error:", error);
        tags = [];
      }
    }

    // FEATURES PARSER
    if (req.body.features) {
      try {
        if (Array.isArray(req.body.features)) {
          features = req.body.features;
        } else if ( typeof req.body.features === "string") {
          const trimmedFeatures = req.body.features.trim();

          if (trimmedFeatures.startsWith("[")) {
            const parsedFeatures = JSON.parse(trimmedFeatures);

            features = Array.isArray(parsedFeatures) ? parsedFeatures : [];
          } else {
            features = trimmedFeatures
              .split(",")
              .map((feature) => feature.trim())
              .filter(Boolean);
          }
        }
      } catch (error) {
        console.error("Features parse error:", error );
        features = [];
      }
    }

    // SPECIFICATIONS PARSER
    if (req.body.specifications) {
      try {
        if ( Array.isArray(req.body.specifications)) {
          specifications = req.body.specifications;
        } else if ( typeof req.body.specifications === "string") {
          const trimmedSpecifications = req.body.specifications.trim();

          if ( trimmedSpecifications.startsWith("[")) {
            const parsedSpecifications = JSON.parse( trimmedSpecifications );

            specifications = Array.isArray( parsedSpecifications ) ? parsedSpecifications : [];
          }
        }
      } catch (error) {
        console.error( "Specifications parse error:", error );
        specifications = [];
      }
    }

    // FEATURES
    try {
      features = req.body.features ? JSON.parse(req.body.features) : [];
    } catch (error) {
      console.error("Features JSON parse error:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid features data.",
      });
    }

    // SPECIFICATIONS
    try {
      specifications = req.body.specifications ? JSON.parse(req.body.specifications) : [];
    } catch (error) {
      console.error( "Specifications JSON parse error:", error );
      return res.status(400).json({
        success: false,
        message: "Invalid specifications data.",
      });
    }

    if (!Array.isArray(tags)) {
      tags = [];
    }

    if (!Array.isArray(features)) {
      features = [];
    }

    if (!Array.isArray(specifications)) {
      specifications = [];
    }

    const rawMainIndex = req.body.newMainIndex;
    const parsedMainIndex = Number(rawMainIndex);
    const mainIndex = Number.isInteger(parsedMainIndex) &&
        parsedMainIndex >= 0 ? parsedMainIndex : -1;

    const sku = `SKU-${Date.now()}-${Math.floor(
      Math.random() * 10000
    )}`;

    if ( Array.isArray(req.files) && req.files.length > 0 ) {
      console.log( `Uploading ${req.files.length} image(s) to Cloudinary...`);

      for (
        let index = 0;
        index < req.files.length;
        index++
      ) {
        const file = req.files[index];

        try {
          console.log( `Uploading image ${index + 1}/${req.files.length}`);
          const result = await uploadToCloudinary(file.buffer, "ecobazar/products" );

          const imageObject = {
            url: result.secure_url,
            public_id: result.public_id,
            isMain: index === mainIndex,
          };
          uploadedImages.push(imageObject);

        } catch (uploadError) {
          console.error("Cloudinary upload failed:", uploadError);

          for (const image of uploadedImages) {
            try {
              if (image.public_id) {
                await deleteFromCloudinary(image.public_id);
              }
            } catch (cleanupError) {
              console.error("Cloudinary cleanup failed:", cleanupError.message);
            }
          }

          return res.status(500).json({
            success: false,
            message: "Failed to upload product image.",
            error: uploadError.message,
          });
        }
      }
    }

    if (uploadedImages.length > 0) {
      const hasMainImage = uploadedImages.some(
        (image) => image.isMain === true
      );

      if (!hasMainImage) {
        uploadedImages[0].isMain = true;
      }
    }

    let mainImageFound = false;
    uploadedImages = uploadedImages.map(
      (image) => {
        if ( image.isMain === true && !mainImageFound ) {
          mainImageFound = true;

          return {
            ...image,
            isMain: true,
          };
        }

        return {
          ...image,
          isMain: false,
        };
      }
    );

    // Create Product
    const product = await Product.create({
      title: title.trim(),
      description: description || "",
      shortDescription: shortDescription || "",
      price: parsedPrice,
      discountType: discountType || "none",
      discountPrice: Number(discountPrice) || 0,
      discountStartDate: discountStartDate ? new Date(discountStartDate) : undefined,
      discountEndDate: discountEndDate ? new Date(discountEndDate) : undefined,
      sku,
      stock: Number(stock) || 0,
      brand: brand || "",
      category: category.trim(),
      subCategory: subCategory || "",
      tag: tags,
      additionalInfo: additionalInfo || "",
      status: status || "active",
      section: productSection, 
      images: uploadedImages,
      specifications,
      features,
    });


    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
    
  } catch (error) {
    console.error("Create Product Error:", error
    );
    if (uploadedImages.length > 0) {
      console.log("Cleaning up uploaded Cloudinary images...");

      for (const image of uploadedImages) {
        try {
          if (image.public_id) {
            await deleteFromCloudinary(
              image.public_id
            );
            console.log("Deleted Cloudinary image:", image.public_id );
          }
        } catch (cleanupError) {
          console.error("Failed to cleanup Cloudinary image:", cleanupError.message);
        }
      }
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product title or SKU already exists.",
        error: error.message,
      });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Product validation failed.",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.updateProductController = async (req, res) => {
  const newlyUploadedPublicIds = [];

  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
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

    // =================================
    // BASIC FIELDS
    // =================================

    if (req.body.title !== undefined) {
      product.title = String(req.body.title).trim();
    }

    if (req.body.description !== undefined) {
      product.description = req.body.description;
    }

    if (req.body.shortDescription !== undefined) {
      product.shortDescription = req.body.shortDescription;
    }

    if (req.body.price !== undefined) {
      const price = Number(req.body.price);
      if (Number.isNaN(price) || price <= 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be greater than 0.",
        });
      }
      product.price = price;
    }

    if (req.body.stock !== undefined) {
      const stock = Number(req.body.stock);
      if (Number.isNaN(stock) || stock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock cannot be negative.",
        });
      }
      product.stock = stock;
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

    if (req.body.section !== undefined) {
      const allowedSections = ["none", "new", "deals", "feature",];

      if (!allowedSections.includes(req.body.section)) {
        return res.status(400).json({
          success: false,
          message: "Invalid section. Allowed: none, new, deals, feature.",
        });
      }
      product.section = req.body.section;
    }

    // DISCOUNT
    if (req.body.discountType !== undefined) {
      product.discountType = req.body.discountType;
    }

    if (req.body.discountPrice !== undefined) {
      product.discountPrice = req.body.discountPrice === "" ? 0 : Number(req.body.discountPrice);
    }

    if (req.body.discountStartDate !== undefined) {
      product.discountStartDate = req.body
        .discountStartDate === ""
        ? null
        : new Date(
          req.body
            .discountStartDate
        );
    }

    if (req.body.discountEndDate !== undefined) {
      product.discountEndDate = req.body.discountEndDate === "" ? null : new Date(
        req.body.discountEndDate
      );
    }
    if (req.body.tag !== undefined) {
      try {
        let tag = req.body.tag;
        if (typeof tag === "string") {
          try {
            tag = JSON.parse(tag);
          } catch {
            tag = tag
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean);
          }
        }

        product.tag = Array.isArray(tag) ? tag
          .map((item) =>
            String(
              item
            ).trim()
          )
          .filter(Boolean)
          : [];

      } catch {
        product.tag = [];
      }
    }

    // SPECIFICATIONS
    if (req.body.specifications !== undefined) {
      try {
        let specifications = req.body.specifications;

        if (typeof specifications === "string") {
          specifications = JSON.parse(specifications);
        }

        if (!Array.isArray(specifications)) {
          return res.status(400).json({
            success: false,
            message: "Specifications must be an array.",
          });
        }

        product.specifications = specifications
          .filter(
            (spec) =>
              spec &&
              spec.name &&
              spec.value
          )
          .map((spec) => ({
            name: String(
              spec.name
            ).trim(),

            value: String(
              spec.value
            ).trim(),
          }));

      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid specifications format.",
        });
      }
    }
    // FEATURES
    if (req.body.features !== undefined) {
      try {
        let features = req.body.features;
        if (typeof features === "string") {
          features = JSON.parse(features);
        }

        if (!Array.isArray(features)) {
          return res.status(400).json({
            success: false,
            message: "Features must be an array.",
          });
        }

        product.features = features
          .map((feature) =>
            String(feature).trim()
          )
          .filter(Boolean);

      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid features format.",
        });
      }
    }

    // IMAGE UPDATE
    const oldImages = (product.images || []).map(
      (image) => ({
        _id: image._id?.toString(),
        url: image.url || "",
        public_id: image.public_id || "",
        isMain: image.isMain === true,
      })
    );

    // Existing Images
    let existingImages;

    if (req.body.existingImages !== undefined) {
      try {
        existingImages = typeof req.body
          .existingImages === "string"
          ? JSON.parse(
            req.body.existingImages
          ) : req.body.existingImages;

        if (!Array.isArray(existingImages)) {
          return res.status(400).json({
            success: false,
            message: "existingImages must be an array.",
          });
        }

      } catch {
        return res.status(400).json({
          success: false,
          message: "Invalid existingImages format.",
        });
      }
    } else {
      existingImages = oldImages;
    }

    // Restore public_id from DB
    existingImages = existingImages
      .map((image) => {
        const databaseImage = oldImages.find((oldImage) =>
          oldImage.url === image?.url
        );

        return {
          _id: image?._id || databaseImage?._id,
          url: image?.url || databaseImage?.url || "",
          public_id: image?.public_id || databaseImage?.public_id || "",
          isMain: image?.isMain === true,
        };
      })
      .filter((image) =>
        image.url &&
        image.public_id
      );

    // REMOVED IMAGES
    const existingUrls = new Set(existingImages.map(
      (image) =>
        image.url
    )
    );

    const removedImages = oldImages.filter((oldImage) =>
      oldImage.url && !existingUrls.has(oldImage.url)
    );

    // DELETE FROM CLOUDINARY
    for (const image of removedImages) {
      if (!image.public_id) {
        continue;
      }

      try {
        await deleteFromCloudinary(image.public_id);
        console.log("Deleted Cloudinary image:", image.public_id);

      } catch (deleteError) {
        console.error("Cloudinary delete failed:", deleteError.message);
      }
    }

    // NEW IMAGE UPLOAD
    const newImages = [];
    if (req.files && req.files.length > 0) {

      if (existingImages.length + req.files.length > 5) {
        return res.status(400).json({
          success: false,
          message: "Maximum 5 images are allowed.",
        });
      }

      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer, "ecobazar/products"
        );

        newlyUploadedPublicIds.push(result.public_id);

        newImages.push({
          url: result.secure_url,
          public_id: result.public_id,
          isMain: false,
        });
      }
    }

    // COMBINE
    const allImages = [...existingImages, ...newImages,];

    // MAIN IMAGE
    const newMainIndex = req.body.newMainIndex !== undefined ? Number(req.body.newMainIndex) : -1;

    if (newMainIndex >= 0) {
      allImages.forEach((image) => {
        image.isMain = false;
      }
      );
      const realIndex = existingImages.length + newMainIndex;

      if (allImages[realIndex]) {
        allImages[realIndex].isMain = true;
      }

    } else {
      const hasMain = allImages.some((image) =>
        image.isMain === true
      );

      if (!hasMain && allImages.length > 0) {
        allImages[0].isMain = true;
      }
    }

    product.images = allImages;

    // SAVE
    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product,
    });

  } catch (error) {
    for (const publicId of newlyUploadedPublicIds) {
      try {
        await deleteFromCloudinary(publicId);
      } catch (cleanupError) {
        console.error("Cloudinary cleanup error:", cleanupError.message);
      }
    }
    console.error("Update Product Error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        error: error.message,
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Product title or SKU already exists.",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.deleteProductController = async (
  req,
  res
) => {
  const { id } = req.params;

  try {

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid product ID",
      });
    }

    const product =
      await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found",
      });
    }

    // Delete Cloudinary images
    for (
      const image
      of product.images || []
    ) {

      if (!image.public_id) {
        continue;
      }

      try {

        await deleteFromCloudinary(
          image.public_id
        );

        console.log(
          "Deleted Cloudinary image:",
          image.public_id
        );

      } catch (
      deleteError
      ) {

        console.error(
          "Cloudinary delete failed:",
          deleteError.message
        );
      }
    }

    // Delete MongoDB product
    const deletedProduct =
      await Product.findByIdAndDelete(
        id
      );

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully.",
      product:
        deletedProduct,
    });

  } catch (error) {

    console.error(
      "Delete Product Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error.",
      error:
        error.message,
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

exports.newProductController = async(req, res) => {
  try {
    const products = await Product.find({ section: 'new' })
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

exports.dealsProductController = async(req, res) => {
  try {
    const products = await Product.find({ section: 'deals' })
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

exports.featureProductController = async(req, res) => {
  try {
    const products = await Product.find({ section: 'feature' })
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






// Category controller
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

exports.deleteCategroyController = async (req, res) => {
  try {
    const { id } = req.params

    const deleteCategroy = await Category.findByIdAndDelete(id)

    if (!id) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Categroy deleted succesfully"
    })

  } catch (error) {

  }
}