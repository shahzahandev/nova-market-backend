import mongoose from "mongoose";

const storeInfoSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      required: [true, "Store name is required"],
      trim: true,
    },

    storeEmail: {
      type: String,
      required: [true, "Store email is required"],
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
    },

    storePolicy: {
      privacyPolicy: {
        type: String,
        default: "",
        trim: true,
      },

      returnPolicy: {
        type: String,
        default: "",
        trim: true,
      },

      shippingPolicy: {
        type: String,
        default: "",
        trim: true,
      },

      termsAndConditions: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

const StoreInfo = mongoose.model("StoreInfo", storeInfoSchema);

export default StoreInfo;