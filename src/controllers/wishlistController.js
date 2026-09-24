const mongoose = require("mongoose");
const Wishlist = require("../models/wishlistModel");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// POST /api/wishlist
// body: { userId, productId }
exports.createWishlistController = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    if (!userId || !productId) {
      return res.status(400).json({ 
        success: false, 
        message: "userId and productId are required" 
    });
    }

    if (!isValidId(userId) || !isValidId(productId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid userId or productId" 
    });
    }

    const wishlist = await Wishlist.create({ userId, productId });

    return res.status(201).json({
      success: true,
      message: "Added to wishlist",
      data: wishlist,
    });
  } catch (error) {
    // Duplicate (same user + same product)
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: "Product already in wishlist" });
    }
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// GET /api/wishlist
exports.getAllWishlist = async (req, res) => {
  try {
    const wishlists = await Wishlist.find()
      .populate("userId", "name email")
      .populate("productId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: wishlists.length,
      data: wishlists,
    });

  } catch (error) {
    return res.status(500).json({ 
        success: false, 
        message: "Server error", error: error.message 
    });
  }
};

// GET /api/wishlist/user/:userId
exports.getSingleUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({ 
            success: false, 
            message: "Invalid userId" 
        });
    }

    const wishlists = await Wishlist.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: wishlists.length,
      data: wishlists,
    });

  } catch (error) {
    return res.status(500).json({ 
        success: false, 
        message: "Server error", error: error.message 
    });
  }
};

// DELETE /api/wishlist/:id   (id = wishlist document _id)
exports.deleteWishlist = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid wishlist id" 
    });
    }

    const deleted = await Wishlist.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Wishlist item not found" 
    });
    }

    return res.status(200).json({ 
        success: true, 
        message: "Removed from wishlist" 
    });

  } catch (error) {
    return res.status(500).json({ 
        success: false, 
        message: "Server error", error: error.message 
    });
  }
};


