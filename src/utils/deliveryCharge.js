const DeliverySetting = require("../models/deliverySettingModel");

const httpError = (status, message) =>
  Object.assign(new Error(message), { status });

// Settings na thakle default diye create kore (race-safe)
const getSettings = () =>
  DeliverySetting.findOneAndUpdate(
    { key: "default" },
    { $setOnInsert: { key: "default" } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

// Site-wide free delivery ekhon cholche kina
const isFreeAllActive = (s, now = new Date()) => {
  if (!s.freeAllEnabled) return false;
  if (s.freeAllStartDate && now < s.freeAllStartDate) return false;
  if (s.freeAllEndDate && now > s.freeAllEndDate) return false;
  return true;
};

// Rule order:
// 1. Site-wide free delivery active  -> 0
// 2. subTotal >= threshold           -> 0
// 3. Na hole area onujayi charge
const calculateDelivery = async (subTotal, deliveryArea) => {
  if (deliveryArea !== "inside" && deliveryArea !== "outside") {
    throw httpError(400, "Please select delivery area (inside or outside Dhaka)");
  }

  const s = await getSettings();

  const baseCharge =
    deliveryArea === "inside" ? s.insideDhakaCharge : s.outsideDhakaCharge;

  let deliveryCharge = baseCharge;
  let freeReason = null;

  if (isFreeAllActive(s)) {
    deliveryCharge = 0;
    freeReason = "promotion";
  } else if (s.freeDeliveryEnabled && subTotal >= s.freeDeliveryThreshold) {
    deliveryCharge = 0;
    freeReason = "threshold";
  }

  return {
    deliveryArea,
    baseCharge,
    deliveryCharge,
    freeReason,
    subTotal,
    grandTotal: subTotal + deliveryCharge,
  };
};

module.exports = { getSettings, isFreeAllActive, calculateDelivery, httpError };