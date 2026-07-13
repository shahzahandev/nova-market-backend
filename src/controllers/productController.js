let Product = require('../models/productModel');


exports.createProductController = async (req, res) => {
    let { title, price, category } = req.body

    try {
        // return emptyFillValidation(res, title, price, category)

        // Empty fill message
        if (!title || !price || !category) {
            return res.status(400).json({
                success: false,
                message: 'All required fields must be provided.'
            })
        }

        // Access product
        let existingProduct = await Product.findOne({ title })

        // If product Or product title already avaiable
        if (existingProduct) {
            return res.status(400).json({
                success: false,
                message: 'Product already exist'
            })
        }

        // Create random SKU
        let sku = `${Date.now() + Math.random()}`

        // Saving proccess in MongoDB start
        let product = new Product({
            ...req.body,
            sku: sku
        })

        await product.save()
        // Saving proccess in MongoDB end

        // success message
        return res.status(201).json({
            success: true,
            message: 'Product created successfully.',
            product: product
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message
        })
    }
}

exports.allProductController = async (req, res) => {
    try {
        let allProduct = await Product.find({})
        return res.status(200).json({
            success: true,
            message: 'All product',
            allProduct: allProduct
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message
        })
    }
}

exports.singleProductController = async (req, res) => {
    let { title } = req.body

    try {
        let singleProductData = await Product.findOne({ title })
        return res.status(200).json({
            success: true,
            message: `Product details.`,
            data: singleProductData
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message
        })
    }
}

exports.deleteProductController = async (req, res) => {
    let { id } = req.body
    try {
        let deleteProductData = await Product.findByIdAndDelete({_id:id })
        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully.'
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message
        })
    }
}

exports.updateProductController = async(req, res) => {
    let {id} = req.params

    try {
        let updateProduct = await Product.findByIdAndUpdate({_id: id}, req.body, {new: true})
        return res.status(200).json({
            success: true,
            message: 'Product update successfully.'
        })
    } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Internal server error. Please try again later.",
            error: error.message
        })
    }
}