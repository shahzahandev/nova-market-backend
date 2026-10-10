import StoreInfo from "../models/storeModel.js";

// Create Store Information
export const createStoreInfo = async (req, res) => {
  try {
    const { storeName, storeEmail, storePolicy } = req.body;

    // Validate required fields
    if (!storeName?.trim() || !storeEmail?.trim() || !storePolicy ||
      typeof storePolicy !== "object" || Array.isArray(storePolicy) || Object.keys(storePolicy).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Store name, email and policy are required.",
      });
    }

    const existingStore = await StoreInfo.findOne();

    if (existingStore) {
      return res.status(409).json({
        success: false,
        message: "Store information already exists. Please update it instead.",
      });
    }
    
    // Create store information
    const store = new StoreInfo({
      storeName: storeName.trim(),
      storeEmail: storeEmail.trim().toLowerCase(),
      storePolicy,
    });

    await store.save();


    return res.status(201).json({
      success: true,
      message: "Store information created successfully",
      storeInfo: store
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
    const { storeName, storeEmail, storePolicy } = req.body;

    const updateData = {};

    // Update only the fields provided
    if (storeName !== undefined) {
      updateData.storeName = storeName;
    }

    if (storeEmail !== undefined) {
      updateData.storeEmail = storeEmail;
    }

    if (storePolicy !== undefined) {
      if (
        !storePolicy ||
        typeof storePolicy !== "object" ||
        Array.isArray(storePolicy)
      ) {
        return res.status(400).json({
          success: false,
          message: "Store policy must be an object",
        });
      }

      const allowedPolicies = [
        "privacyPolicy",
        "returnPolicy",
        "shippingPolicy",
        "termsAndConditions",
      ];

      const invalidPolicies = Object.keys(storePolicy).filter(
        (key) => !allowedPolicies.includes(key)
      );

      if (invalidPolicies.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid policy fields: ${invalidPolicies.join(", ")}`,
        });
      }

      // Update individual policy fields without replacing other policies
      for (const [key, value] of Object.entries(storePolicy)) {
        if (typeof value !== "string") {
          return res.status(400).json({
            success: false,
            message: `${key} must be a string`,
          });
        }

        updateData[`storePolicy.${key}`] = value;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one field to update",
      });
    }

    const storeInfo = await StoreInfo.findOneAndUpdate({},
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
