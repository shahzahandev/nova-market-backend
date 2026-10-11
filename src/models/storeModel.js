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

    storeAddress: {
      type: String,
      required: [true, "Store address is required"],
      trim: true,
    },

    storePhone: {
      type: [String],
      required: [true, "At least one store phone number is required"],
      validate: [
        {
          validator: (numbers) =>
            Array.isArray(numbers) &&
            numbers.length >= 1 &&
            numbers.length <= 2,
          message: "You must provide 1 or 2 phone numbers only",
        },
        {
          validator: (numbers) =>
            numbers.every(
              (number) =>
                typeof number === "string" &&
                number.trim() !== ""
            ),
          message: "Phone numbers cannot be empty",
        },
      ],
      default: undefined,
    },
    
    returnPolicy: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const StoreInfo = mongoose.model("StoreInfo", storeInfoSchema);

export default StoreInfo;