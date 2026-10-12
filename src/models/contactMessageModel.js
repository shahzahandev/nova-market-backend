const mongoose = require("mongoose");

const contactMessageSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Email is too long"],
    },

    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      maxlength: [20, "Phone number is too long"],
    },

    comment: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },

    status: {
      type: String,
      enum: ["New", "In Progress", "Replied", "Resolved", "Spam" ],
      default: "New",
    },
  }, { timestamps: true });

module.exports = mongoose.model("ContactMessage", contactMessageSchema);
