
import StoreInfo from "../models/storeModel.js";

// Allowed store policy fields
const allowedPolicies = [
  "privacyPolicy",
  "returnPolicy",
  "shippingPolicy",
  "termsAndConditions",
];

// Validate store phone numbers
const validateStorePhones = (phones) => {
  return (
    Array.isArray(phones) &&
    phones.length >= 1 &&
    phones.length <= 2 &&
    phones.every(
      (phone) =>
        typeof phone === "string" && phone.trim() !== ""
    )
  );
};

// Validate store policy object
const validateStorePolicy = (storePolicy) => {
  if (
    !storePolicy ||
    typeof storePolicy !== "object" ||
    Array.isArray(storePolicy)
  ) {
    return "Store policy must be an object";
  }

  const invalidPolicies = Object.keys(storePolicy).filter(
    (key) => !allowedPolicies.includes(key)
  );

  if (invalidPolicies.length > 0) {
    return `Invalid policy fields: ${invalidPolicies.join(", ")}`;
  }

  for (const [key, value] of Object.entries(storePolicy)) {
    if (typeof value !== "string") {
      return `${key} must be a string`;
    }
  }

  return null;
};

// Create Store Information
export const createStoreInfo = async (req, res) => {
  try {
    const {
      storeName,
      storeEmail,
      storeAddress,
      storePhone,
      storePolicy,
    } = req.body;

    // Validate store name
    if (
      typeof storeName !== "string" ||
      !storeName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Store name is required",
      });
    }

    // Validate store email
    if (
      typeof storeEmail !== "string" ||
      !storeEmail.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Store email is required",
      });
    }

    const normalizedEmail = storeEmail.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    // Validate store address
    if (
      typeof storeAddress !== "string" ||
      !storeAddress.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Store address is required",
      });
    }

    // Validate store phone numbers
    if (!validateStorePhones(storePhone)) {
      return res.status(400).json({
        success: false,
        message:
          "Provide at least 1 and at most 2 valid phone numbers",
      });
    }

    // Validate store policy if provided
    if (storePolicy !== undefined) {
      const policyError = validateStorePolicy(storePolicy);

      if (policyError) {
        return res.status(400).json({
          success: false,
          message: policyError,
        });
      }
    }

    // Check existing store information
    const existingStore = await StoreInfo.findOne();

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message:"Store information already exists. Please update it instead.",
      });
    }

    // Prepare store data
    const storeData = {
      storeName: storeName.trim(),
      storeEmail: normalizedEmail,
      storeAddress: storeAddress.trim(),
      storePhone: storePhone.map((phone) => phone.trim()),
    };

    if (storePolicy !== undefined) {
      storeData.storePolicy = storePolicy;
    }

    // Create store information
    const store = await StoreInfo.create(storeData);

    return res.status(201).json({
      success: true,
      message: "Store information created successfully",
      storeInfo: store,
    });
  } catch (error) {
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
      storePolicy,
    } = req.body;

    const updateData = {};

    // Update store name
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

    // Update store email
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

      const normalizedEmail = storeEmail.trim().toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid email address",
        });
      }

      updateData.storeEmail = normalizedEmail;
    }

    // Update store address
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

    // Update store phone numbers
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

    // Update individual store policy fields
    if (storePolicy !== undefined) {
      const policyError = validateStorePolicy(storePolicy);

      if (policyError) {
        return res.status(400).json({
          success: false,
          message: policyError,
        });
      }

      for (const [key, value] of Object.entries(storePolicy)) {
        updateData[`storePolicy.${key}`] = value.trim();
      }
    }

    // Check whether any field was provided
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    // Update existing store information
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
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
