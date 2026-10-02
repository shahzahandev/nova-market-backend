const DeliverySetting = require("../models/deliverySettingModel");
const { getSettings, isFreeAllActive } = require("../utils/deliveryCharge");

// PUBLIC: Checkout page eta theke rate niye dekhay
exports.getDeliverySettings = async (req, res) => {
  try {
    const s = await getSettings();
    return res.status(200).json({
      success: true,
      settings: {
        insideDhakaCharge: s.insideDhakaCharge,
        outsideDhakaCharge: s.outsideDhakaCharge,
        freeDeliveryEnabled: s.freeDeliveryEnabled,
        freeDeliveryThreshold: s.freeDeliveryThreshold,
        freeAllEnabled: s.freeAllEnabled,
        freeAllStartDate: s.freeAllStartDate,
        freeAllEndDate: s.freeAllEndDate,
        // server er shomoy onujayi calculate kora, tai timezone er jhamela nai
        freeAllActive: isFreeAllActive(s),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// ADMIN: Dashboard theke update (route e admin middleware lagbe)
exports.updateDeliverySettings = async (req, res) => {
  try {
    const body = req.body;
    const update = {};

    // Number fields
    for (const key of [
      "insideDhakaCharge",
      "outsideDhakaCharge",
      "freeDeliveryThreshold",
    ]) {
      if (body[key] !== undefined) {
        const n = Number(body[key]);
        if (!Number.isFinite(n) || n < 0) {
          return res.status(400).json({
            success: false,
            message: `${key} must be a number (0 or more)`,
          });
        }
        update[key] = n;
      }
    }

    // Boolean fields
    for (const key of ["freeDeliveryEnabled", "freeAllEnabled"]) {
      if (body[key] !== undefined) update[key] = Boolean(body[key]);
    }

    // Date fields (null/"" dile muche jabe)
    for (const key of ["freeAllStartDate", "freeAllEndDate"]) {
      if (body[key] !== undefined) {
        if (body[key] === null || body[key] === "") {
          update[key] = null;
        } else {
          const d = new Date(body[key]);
          if (Number.isNaN(d.getTime())) {
            return res.status(400).json({
              success: false,
              message: `${key} is not a valid date`,
            });
          }
          update[key] = d;
        }
      }
    }

    // Start end er porer hole error
    const current = await getSettings();
    const start = "freeAllStartDate" in update ? update.freeAllStartDate : current.freeAllStartDate;
    const end = "freeAllEndDate" in update ? update.freeAllEndDate : current.freeAllEndDate;
    if (start && end && start > end) {
      return res.status(400).json({
        success: false,
        message: "Start date must be before end date",
      });
    }

    const settings = await DeliverySetting.findOneAndUpdate(
      { key: "default" },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Delivery settings updated",
      settings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};