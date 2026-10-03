const axios = require("axios");
const Cart = require("../models/cardModel");
const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const { calculateDelivery, httpError } = require("../utils/deliveryCharge");
const mongoose = require("mongoose");


const FRONTEND_URL = process.env.FRONTEND_URL;

const getTranId = (req) =>
  req.body?.mer_txnid || req.body?.tran_id || req.query?.tranId || "";

// Aamarpay er server theke payment ashole hoyeche kina verify kora
const verifyAamarpayPayment = async (tranId) => {
  const response = await axios.get(
    process.env.AAMARPAY_VERIFY_URL ||
    "https://sandbox.aamarpay.com/api/v1/trxcheck/request.php",
    {
      params: {
        request_id: tranId,
        store_id: process.env.AAMARPAY_STORE_ID || "aamarpaytest",
        signature_key:
          process.env.AAMARPAY_SIGNATURE_KEY || "dbb74894e82415a2f7ff0ec3a97e4183",
        type: "json",
      },
    }
  );

  return response.data; // pay_status, mer_txnid, amount ityadi
};






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
      productId: item.product._id,
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
    const withTranId = (url) => `${url}${url.includes("?") ? "&" : "?"}tranId=${tranId}`

    const payload = {
      store_id: process.env.AAMARPAY_STORE_ID,
      tran_id: tranId,
      success_url: withTranId(process.env.PAYMENT_SUCCESS_URL),
      fail_url: withTranId(process.env.PAYMENT_FAIL_URL),
      cancel_url: withTranId(process.env.PAYMENT_CANCEL_URL),
      currency: "BDT",
      signature_key: process.env.AAMARPAY_SIGNATURE_KEY,
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
      paymentStatus: "pending",
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
      await Cart.deleteMany({ user: order.user });
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



// ---------------------------------------------------------------
// Stock helpers
// ---------------------------------------------------------------

// pending ar cancelled chhara baki status e order er stock "dhore rakha" thake
const holdsStock = (status) => status !== "pending" && status !== "cancelled";

// Order er item theke product khuje ber korar filter.
// Notun order e productId thakbe, purano order e nei, tai sku fallback
const getStockFilter = (item) => (item.productId ? { _id: item.productId } : { sku: item.sku });

// Ekoi product order e duibar thakle quantity jog kore ekta entry banay
const groupItems = (order) => {
  const map = new Map();

  for (const item of order.products || []) {
    const quantity = Number(item.quantity) || 0;
    const key = item.productId ? String(item.productId) : `sku:${item.sku}`;

    if (!map.has(key)) {
      map.set(key, { filter: getStockFilter(item), title: item.title, quantity: 0 });
    }
    map.get(key).quantity += quantity;
  }

  return [...map.values()].filter((item) => item.quantity > 0);
};

// Stock ferot dewa (product delete hoye gele skip hobe)
const restoreItems = async (items) => {
  for (const item of items) {
    await Product.updateOne(item.filter, { $inc: { stock: item.quantity } });
  }
};

// Stock komano. Protita product e "stock >= quantity" condition thake,
// tai ekshathe duita order hole-o stock negative hobe na.
// Kono ekta product fail korle ager komano gulo ferot diye dey (all-or-nothing)
const deductStock = async (order) => {
  const done = [];

  for (const item of groupItems(order)) {
    const result = await Product.updateOne(
      { ...item.filter, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } }
    );

    if (result.modifiedCount === 0) {
      await restoreItems(done);

      const product = await Product.findOne(item.filter).select("stock");
      return {
        ok: false,
        message: product
          ? `Not enough stock for "${item.title}". Available: ${product.stock}, required: ${item.quantity}`
          : `Product "${item.title}" no longer exists`,
      };
    }

    done.push(item);
  }

  return { ok: true, done };
};

// ---------------------------------------------------------------
// Controller
// ---------------------------------------------------------------

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

    const previousStatus = order.status;

    // ---------- Stock logic ----------
    let deductedItems = []; // save fail korle ferot dewar jonno
    let restoredItems = [];

    if (holdsStock(status) && !order.stockDeducted) {
      // Online order er payment confirm na hole stock komabe na
      if (order.paymentMethod === "online" && order.paymentStatus === "pending") {
        return res.status(400).json({
          success: false,
          message: "Payment is not confirmed yet for this online order",
        });
      }

      const result = await deductStock(order);

      if (!result.ok) {
        return res.status(400).json({
          success: false,
          message: result.message,
        });
      }

      deductedItems = result.done;
      order.stockDeducted = true;
    } else if (!holdsStock(status) && order.stockDeducted) {
      restoredItems = groupItems(order);
      await restoreItems(restoredItems);
      order.stockDeducted = false;
    }

    // ---------- Status update ----------
    order.status = status;

    // Notun kore delivered hole date save hobe,
    // delivered theke onno status e gele deliveredAt muchhe jabe
    if (status === "delivered" && previousStatus !== "delivered") {
      order.deliveredAt = new Date();
    } else if (status !== "delivered") {
      order.deliveredAt = null;
    }

    try {
      await order.save();
    } catch (saveError) {
      // Order save na hole stock change ta undo kore dao
      if (deductedItems.length) {
        await restoreItems(deductedItems);
      } else if (restoredItems.length) {
        await deductStock({ products: order.products });
      }
      throw saveError;
    }

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