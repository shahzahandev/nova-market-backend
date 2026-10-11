
import StoreInfo from "../models/storeModel.js";

// Validate store phone numbers
const validateStorePhones = (phones) => {
  return (
    Array.isArray(phones) &&
    phones.length >= 1 &&
    phones.length <= 2 &&
    phones.every(
      (phone) =>
        typeof phone === "string" &&
        phone.trim() !== ""
    )
  );
};

// Create Store Information
export const createStoreInfo = async (req, res) => {
  try {
    const {
      storeName,
      storeEmail,
      storeAddress,
      storePhone,
      returnPolicy,
    } = req.body;

    // Validate required fields
    if (!storeName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Store name is required",
      });
    }

    if (!storeEmail?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Store email is required",
      });
    }

    if (!storeAddress?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Store address is required",
      });
    }

    if (!validateStorePhones(storePhone)) {
      return res.status(400).json({
        success: false,
        message:
          "Provide at least 1 and at most 2 valid phone numbers",
      });
    }

    // Check whether store information already exists
    const existingStore = await StoreInfo.findOne();

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message:
          "Store information already exists. Please update it instead.",
      });
    }

    // Prepare store data
    const storeData = {
      storeName: storeName.trim(),
      storeEmail: storeEmail.trim().toLowerCase(),
      storeAddress: storeAddress.trim(),
      storePhone: storePhone.map((phone) => phone.trim()),
      returnPolicy:
        typeof returnPolicy === "string"
          ? returnPolicy.trim()
          : "",
    };

    const storeInfo = await StoreInfo.create(storeData);

    return res.status(201).json({
      success: true,
      message: "Store information created successfully",
      storeInfo,
    });
  } catch (error) {
    console.error("Create store info error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Store Information
export const getStoreInfo = async (req, res) => {
  try {
    const storeInfo = await StoreInfo.findOne();

    if (!storeInfo) {
      return res.status(404).json({
        success: false,
        message: "Store information not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Store information fetched successfully",
      storeInfo,
    });
  } catch (error) {
    console.error("Get store info error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Store Information
export const updateStoreInfo = async (req, res) => {
  try {
    const {
      storeName,
      storeEmail,
      storeAddress,
      storePhone,
      returnPolicy,
    } = req.body;

    const updateData = {};

    if (storeName !== undefined) {
      if (
        typeof storeName !== "string" ||
        !storeName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Store name cannot be empty",
        });
      }

      updateData.storeName = storeName.trim();
    }

    if (storeEmail !== undefined) {
      if (
        typeof storeEmail !== "string" ||
        !storeEmail.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Store email cannot be empty",
        });
      }

      updateData.storeEmail = storeEmail.trim().toLowerCase();
    }

    if (storeAddress !== undefined) {
      if (
        typeof storeAddress !== "string" ||
        !storeAddress.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Store address cannot be empty",
        });
      }

      updateData.storeAddress = storeAddress.trim();
    }

    if (storePhone !== undefined) {
      if (!validateStorePhones(storePhone)) {
        return res.status(400).json({
          success: false,
          message:
            "Provide at least 1 and at most 2 valid phone numbers",
        });
      }

      updateData.storePhone = storePhone.map((phone) =>
        phone.trim()
      );
    }

    if (returnPolicy !== undefined) {
      if (typeof returnPolicy !== "string") {
        return res.status(400).json({
          success: false,
          message: "Return policy must be a string",
        });
      }

      updateData.returnPolicy = returnPolicy.trim();
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    const storeInfo = await StoreInfo.findOneAndUpdate(
      {},
      { $set: updateData },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!storeInfo) {
      return res.status(404).json({
        success: false,
        message: "Store information not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Store information updated successfully",
      storeInfo,
    });
  } catch (error) {
    console.error("Update store info error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
