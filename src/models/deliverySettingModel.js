const mongoose = require("mongoose");

// Shudhu ekta document thakbe (key: "default")
const deliverySettingSchema = new mongoose.Schema(
  {
    key: { type: String, default: "default", unique: true },

    insideDhakaCharge: { type: Number, default: 60, min: 0 },
    outsideDhakaCharge: { type: Number, default: 120, min: 0 },

    // Cart total threshold er upor free delivery
    freeDeliveryEnabled: { type: Boolean, default: true },
    freeDeliveryThreshold: { type: Number, default: 2000, min: 0 },

    // Site-wide free delivery (shob product, nidisto somoy)
    freeAllEnabled: { type: Boolean, default: false },
    freeAllStartDate: { type: Date, default: null },
    freeAllEndDate: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DeliverySetting", deliverySettingSchema);