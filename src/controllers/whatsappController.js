const WhatsAppSetting = require("../models/whatsappModels");


exports.createWhatsApp = async (req, res) => {
  try {
    const { phone, isActive } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp number is required.",
      });
    }

    // Check if WhatsApp setting already exists
    const existingWhatsApp = await WhatsAppSetting.findOne();

    if (existingWhatsApp) {
      return res.status(409).json({
        success: false,
        message: "WhatsApp setting already exists.",
      });
    }

    const whatsapp = new WhatsAppSetting({
      phone,
      isActive: isActive ?? true,
    });

    await whatsapp.save();

    return res.status(201).json({
      success: true,
      message: "WhatsApp number created successfully.",
      data: whatsapp,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};


exports.getWhatsApp = async (req, res) => {
  try {
    const whatsapp = await WhatsAppSetting.findOne();

    if (!whatsapp) {
      return res.status(404).json({
        success: false,
        message: "WhatsApp setting not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: whatsapp,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};

exports.updateWhatsApp = async (req, res) => {
  try {
    const { phone, isActive } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "WhatsApp number is required.",
      });
    }

    const whatsapp = await WhatsAppSetting.findOne();

    if (!whatsapp) {
      return res.status(404).json({
        success: false,
        message: "WhatsApp setting not found.",
      });
    }

    whatsapp.phone = phone;

    if (typeof isActive === "boolean") {
      whatsapp.isActive = isActive;
    }

    await whatsapp.save();

    return res.status(200).json({
      success: true,
      message: "WhatsApp settings updated successfully.",
      data: whatsapp,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: error.message,
    });
  }
};