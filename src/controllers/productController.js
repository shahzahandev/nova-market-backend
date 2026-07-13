let Product = require('../models/productModel');


exports.createProductController = async (req, res) => {
    let { title, price, category } = req.body;

    try {
        // Empty fill message
        if (!title || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided.'
            });
        }

        // Access product
        let existingProduct = await Product.findOne({ title });

        // If product Or product title already avaiable
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Product already exist'
            });
        }

        // Create random SKU
        let sku = `${Date.now() + Math.random()}`;

        // Saving proccess in MongoDB start
        let product = new Product({
            ...req.body,
            sku: sku
        });

        await product.save();
        // 
        // success message
        return res.status(201).json({
            success: true,
            message: 'Product created successfully.',
            product: product
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
    let { title } = req.body;

    try {
        let singleProductData = await Product.findOne({ title });

        if (!title) {
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