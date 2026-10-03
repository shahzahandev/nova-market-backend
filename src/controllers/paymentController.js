const axios = require("axios");
const Cart = require("../models/cardModel");
const Order = require("../models/orderModel");
const { calculateDelivery, httpError } = require("../utils/deliveryCharge");
const mongoose = require("mongoose");


// Cart theke product list + subtotal + delivery charge (server side)
const buildCheckout = async ({ userId, deliveryArea }) => {
  if (!userId) throw httpError(400, "userId is required");

  const cart = await Cart.find({ user: userId }).populate("product");
  const items = cart.filter((item) => item.product); // delete hoye gelo product skip

  if (items.length === 0) throw httpError(400, "Cart is empty");

  let subTotal = 0;
  const productInfo = items.map((item) => {
    subTotal += item.totalPrice;
    return {
      title: item.product.title,
      price: item.product.price,
      discountPrice: item.product.discountPrice,
      sku: item.product.sku,
      stock: item.product.stock,
      category: item.product.category,
      tag: item.product.tag,
      status: item.product.status,
      quantity: item.quantity,
      totalPrice: item.totalPrice,
    };
  });

  const delivery = await calculateDelivery(subTotal, deliveryArea);

  return { productInfo, ...delivery };
};

const makeTranId = (name) => {
  const ts = Date.now().toString();
  const rand = Math.floor(Math.random() * 900 + 100);

  // Name থেকে শুধু English letter বের করা
  const englishName = (name || "").match(/[A-Za-z]/g);

  let prefix;

  if (englishName && englishName.length >= 2) {
    // English name হলে প্রথম 2 letter
    prefix = englishName.slice(0, 2).join("").toUpperCase();
  } else {
    // বাংলা বা English letter না থাকলে random 2 English letter
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    prefix =
      letters[Math.floor(Math.random() * 26)] +
      letters[Math.floor(Math.random() * 26)];
  }

  return `${prefix}${ts.slice(-5)}Eco${rand}`;
};


const buildShipping = (b) => ({
  name: b.cus_name,
  phone: b.cus_phone,
  email: b.cus_email,
  address: b.cus_add1,
  city: b.cus_city,
  postcode: b.cus_postcode,
});

// ---------------- ONLINE PAYMENT ----------------
exports.paymentController = async (req, res) => {
  const {
    userId, deliveryArea, cus_name, cus_email, cus_add1, cus_add2,
    cus_city, cus_state, cus_postcode, cus_phone,
  } = req.body;

  try {
    if (!cus_name) throw httpError(400, "Customer name is required");

    const { productInfo, subTotal, deliveryCharge, grandTotal } =
      await buildCheckout({ userId, deliveryArea });

    const tranId = makeTranId(cus_name);

    const payload = {
      store_id: "aamarpaytest",
      tran_id: tranId,
      success_url: process.env.PAYMENT_SUCCESS_URL || "http://localhost:5174" || "http://localhost:5173",
      fail_url: process.env.PAYMENT_FAIL_URL  || "http://localhost:5174" || "http://localhost:5173",
      cancel_url: process.env.PAYMENT_CANCEL_URL  || "http://localhost:5174" || "http://localhost:5173",
      currency: "BDT",
      signature_key: "dbb74894e82415a2f7ff0ec3a97e4183",
      desc: "Nova Market Order",
      amount: grandTotal, // cart total + delivery charge
      cus_name,
      cus_email,
      cus_add1,
      cus_add2,
      cus_city,
      cus_state,
      cus_postcode,
      cus_phone,
      type: "json",
      cus_country: "Bangladesh",
    };

    // Gateway call age, order save pore: gateway fail hole faltu order thake na
    const response = await axios.post(
      "https://sandbox.aamarpay.com/jsonpost.php",
      payload,
      { headers: { "Content-Type": "application/json" } }
    );

    const order = new Order({
      user: userId,
      products: productInfo,
      subTotal,
      deliveryCharge,
      deliveryArea,
      totalPrice: grandTotal,
      paymentMethod: "online",
      shipping: buildShipping(req.body),
      tranId,
    });
    await order.save();

    return res.status(200).json({
      success: true,
      products: productInfo,
      subTotal,
      deliveryCharge,
      totalCardAmout: grandTotal,
      tranId,
      paymentLink: response.data,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);
    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Payment request failed",
      error: error.response?.data || error.message,
    });
  }
};

// SUCCESS
exports.paymentSuccess = async (req, res) => {
  const tranId = getTranId(req);

  try {
    const order = await Order.findOne({ tranId });

    if (!order) {
      return res.redirect(303, `${FRONTEND_URL}/payment/fail?tranId=${tranId}`);
    }

    const result = await verifyAamarpayPayment(tranId);

    const isPaid =
      result.pay_status === "Successful" &&
      result.mer_txnid === tranId &&
      Number(result.amount) === Number(order.totalPrice);

    if (!isPaid) {
      order.paymentStatus = "failed";
      order.status = "cancelled";
      await order.save();
      return res.redirect(303, `${FRONTEND_URL}/payment/fail?tranId=${tranId}`);
    }

    // Duplicate callback hole abar update korbe na
    if (order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      await order.save();
    }

    return res.redirect(303, `${FRONTEND_URL}/payment/success?tranId=${tranId}`);
  } catch (error) {
    console.error("Payment success error:", error.response?.data || error.message);
    return res.redirect(303, `${FRONTEND_URL}/payment/fail?tranId=${tranId}`);
  }
};

// FAIL
exports.paymentFail = async (req, res) => {
  const tranId = getTranId(req);

  try {
    if (tranId) {
      await Order.findOneAndUpdate(
        { tranId, paymentStatus: { $ne: "paid" } },
        { paymentStatus: "failed", status: "cancelled" }
      );
    }
  } catch (error) {
    console.error("Payment fail error:", error);
  }

  return res.redirect(303, `${FRONTEND_URL}/payment/fail?tranId=${tranId}`);
};

// CANCEL
exports.paymentCancel = async (req, res) => {
  const tranId = getTranId(req);

  try {
    if (tranId) {
      await Order.findOneAndUpdate(
        { tranId, paymentStatus: { $ne: "paid" } },
        { paymentStatus: "cancelled", status: "cancelled" }
      );
    }
  } catch (error) {
    console.error("Payment cancel error:", error);
  }

  return res.redirect(303, `${FRONTEND_URL}/payment/cancel?tranId=${tranId}`);
};

// ---------------- CASH ON DELIVERY ----------------
exports.codController = async (req, res) => {
  const { userId, deliveryArea, cus_name } = req.body;

  try {
    if (!cus_name) throw httpError(400, "Customer name is required");

    const { productInfo, subTotal, deliveryCharge, grandTotal } =
      await buildCheckout({ userId, deliveryArea });

    const tranId = makeTranId(cus_name);

    const order = new Order({
      user: userId,
      products: productInfo,
      subTotal,
      deliveryCharge,
      deliveryArea,
      totalPrice: grandTotal,
      paymentMethod: "cod",
      shipping: buildShipping(req.body),
      tranId,
    });
    await order.save();

    // Order hoye gele cart clear
    await Cart.deleteMany({ user: userId });

    return res.status(200).json({
      success: true,
      message: "Order placed",
      tranId,
      subTotal,
      deliveryCharge,
      grandTotal,
      order,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.status ? error.message : "Server Error",
      error: error.message,
    });
  }
};

exports.getSingleUserOrders = async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate userId
    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user id",
      });
    }

    // Find all orders of this user
    const orders = await Order.find({ user: userId }).populate('user')
      .sort({ createdAt: -1 });

    // No orders found
    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for this user",
        orders: [],
        total: 0,
      });
    }

    return res.status(200).json({
      success: true,
      message: "User orders fetched successfully",
      orders,
      total: orders.length,
    });

  } catch (error) {
    console.error("Get user orders error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.allOrder = async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);

    const [orders, total] = await Promise.all([
      Order.find({})
        .sort({ _id: -1 }) // notun order age
        .skip((page - 1) * limit)
        .limit(limit),
      Order.countDocuments({}),
    ]);

    return res.status(200).json({
      success: true,
      message: "Fetching all Order successfully",
      order: orders, // key naam ager moto-i rakhlam
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate order ID
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    // Validate status
    const allowedStatus = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    // Find order
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only status will be updated
    order.status = status;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};