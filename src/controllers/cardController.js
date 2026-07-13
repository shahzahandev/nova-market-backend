const Card = require('../models/cardModel');
const Product = require('../models/productModel');


exports.createCart = async (req, res) => {
    try {
        const { proid, userid } = req.body

        const existingProduct = await Product.findOne({ _id: proid })

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            })
        }

        const existingProductOnCart = await Card.findOne({ product: proid, user: userid });

        if (existingProductOnCart) {
            existingProductOnCart.quantity += 1
            const finalPrice = existingProduct.discountPrice > 0 ? existingProduct.discountPrice : existingProduct.price;
            existingProductOnCart.totalPrice = existingProductOnCart.quantity * finalPrice
            await existingProductOnCart.save();

            return res.status(200).json({
                success: true,
                message: 'Product quantity updated successfully',
                data: existingProductOnCart
            });
        }

        let card = new Card({
            product: proid,
            user: userid,
            quantity: 1,
            totalPrice: existingProduct.price,
        })
        await card.save();

        return res.status(200).json({
            success: true,
            message: 'Product added successfully',
            data: card
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        })
    }

}

exports.increDecre = async (req, res) => {
    try {
        const { id } = req.params // this id will be card id
        const { type, userid } = req.body

        const cart = await Card.findOne({ _id: id, user: userid });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart item not found"
            });
        }
        const product = await Product.findById(cart.product)

        if (type === 'plus') {
            cart.quantity += 1;
        } else if (type === 'minus') {
            if (cart.quantity <= 1) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity cannot be less than 1'
                });
            }
            cart.quantity -= 1;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid type. Use plus or minus'
            });
        }

        cart.totalPrice = cart.quantity * product.price;
        await cart.save();

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: cart
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        })
    }
}

exports.cartdelete = async (req, res) => {
    try {
        const { id } = req.params

        const deletedCart = await Card.findByIdAndDelete({ _id: id })

        if (!deletedCart) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Product Deleted sucessfully'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
}

exports.getSingleCard = async (req, res) => {
    try {
        const { userId } = req.params

        const card = await Card.find({ user: userId }).populate("user product"); 

        let totalPrice = 0;
        card.map(item => {
            totalPrice += item.totalPrice
        })

        return res.status(200).json({
            success: true,
            card,
            totalPrice
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Server Error'
        })
    }
}

exports.allCard = async(req, res) => {
    try {
         const card = await Card.find({});
         return res.status(200).json({
            success: false.valueOf,
            message: 'Fetching all cart successfully',
            card
         });       
    } catch (error) {
          return res.status(500).json({
            success: false,
            message: 'Server Error',
            error: error.message
        });
    }
}