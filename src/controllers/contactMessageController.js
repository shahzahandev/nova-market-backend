const mongoose = require("mongoose");
const ContactMessage = require("../models/contactMessageModel");

// 1. CUSTOMER: CREATE CONTACT MESSAGE
exports.createContactMessage = async (req, res) => {
  try {
    const { name, email, phone, comment } = req.body;

    // Required field validation
    if (
      !name?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !comment?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Length validation
    if (
      name.trim().length > 100 ||
      email.trim().length > 254 ||
      phone.trim().length > 20 ||
      comment.trim().length > 2000
    ) {
      return res.status(400).json({
        success: false,
        message: "One or more fields exceed the allowed length",
      });
    }

    // Save message to MongoDB
    const contactMessage = await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      comment: comment.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Your message has been submitted successfully",
      contactMessage: {
        _id: contactMessage._id,
        name: contactMessage.name,
        status: contactMessage.status,
        createdAt: contactMessage.createdAt,
      },
    });
  } catch (error) {
    console.error("Create Contact Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to submit your message",
    });
  }
};

// 2. ADMIN: GET ALL CONTACT MESSAGES
exports.getAllContactMessages = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number(req.query.limit) || 10)
    );

    const filter = {};

    if (req.query.status) {
      const allowedStatuses = [
        "New",
        "In Progress",
        "Replied",
        "Resolved",
        "Spam",
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter",
        });
      }

      filter.status = req.query.status;
    }

    const [messages, totalMessages] = await Promise.all([
      ContactMessage.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      ContactMessage.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      totalMessages,
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      contactMessages: messages,
    });
  } catch (error) {
    console.error("Get Contact Messages Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact messages",
    });
  }
};

// 3. ADMIN: GET SINGLE CONTACT MESSAGE
exports.getSingleContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const contactMessage = await ContactMessage.findById(id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      contactMessage,
    });
  } catch (error) {
    console.error("Get Single Contact Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch contact message",
    });
  }
};

// 4. ADMIN: UPDATE MESSAGE STATUS
exports.updateContactMessageStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "New",
      "In Progress",
      "Replied",
      "Resolved",
      "Spam",
    ];

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact message status",
      });
    }

    const contactMessage = await ContactMessage.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message status updated successfully",
      contactMessage,
    });
  } catch (error) {
    console.error("Update Contact Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update message status",
    });
  }
};

// 5. ADMIN: DELETE CONTACT MESSAGE
exports.deleteContactMessage = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    const contactMessage = await ContactMessage.findByIdAndDelete(id);

    if (!contactMessage) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Contact message deleted successfully",
    });
  } catch (error) {
    console.error("Delete Contact Message Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete contact message",
    });
  }
};
