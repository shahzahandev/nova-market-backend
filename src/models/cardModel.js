const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
   product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
   },
   quantity: {
      type: Number,
      min: 1,
      required: true
   },
   totalPrice:{
      type: Number,
      required: true
   },
   user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
   }
});

// Same user same product duplicate cart item create korte parbe na
cardSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = mongoose.model("Card", cardSchema)