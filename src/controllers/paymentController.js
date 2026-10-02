// const axios = require('axios');
// const Cart = require("../models/cardModel");
// const Order = require('../models/orderModel');

// exports.paymentController = async (req, res) => {

//   const { userId, cus_name, cus_email, cus_add1, cus_add2, cus_city, cus_state, cus_postcode, cus_phone } = req.body

//   try {
//     const card = await Cart.find({ user: userId }).populate('user product')

//     let totalCardAmout = 0;
//     let productInfo = [];
//     card.map(item => {
//       productInfo.push({
//         title: item.product.titile,
//         price: item.product.price,
//         discountPrice: item.product.discountPrice,
//         sku: item.product.sku,
//         stock: item.product.stock,
//         category: item.product.category,
//         tag: item.product.tag,
//         status: item.product.status,
//         quantity: item.quantity,
//         totalPrice: item.totalPrice
//       })

//       user = item.user
//       totalCardAmout += item.totalPrice
//     });

//     // create a Random transaction Id
//     let firstThreeletter = cus_name.slice(0, 2)
//     let randomNumber = Date.now().toString()
//     let randomNumber2 = Date.now().toString();
//     let ecoName = 'Eco';
//     let tranId = firstThreeletter + randomNumber.slice(-5) + ecoName + randomNumber2.slice(-3);


//     const payload = {
//       store_id: "aamarpaytest",
//       tran_id: tranId,
//       success_url: "http://www.merchantdomain.com/successpage.html",
//       fail_url: "http://www.merchantdomain.com/failedpage.html",
//       cancel_url: "http://www.merchantdomain.com/cancelpage.html",
//       currency: "BDT",
//       signature_key: "dbb74894e82415a2f7ff0ec3a97e4183",
//       desc: "Merchant Registration Payment",
//       amount: totalCardAmout,
//       cus_name: cus_name,
//       cus_email: cus_email,
//       cus_add1: cus_add1,
//       cus_add2: cus_add2,
//       cus_city: cus_city,
//       cus_state: cus_state,
//       cus_postcode: cus_postcode,
//       cus_phone: cus_phone,
//       type: "json",
//       cus_country: "Bangladesh",
//     };

//     // Order saving process
//     const order = new Order({
//       user: userId,
//       products: productInfo,
//       totalPrice: totalCardAmout,
//       tranId: tranId
//     });
//     await order.save();


//     const response = await axios.post(
//       "https://sandbox.aamarpay.com/jsonpost.php",
//       payload,
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       products: productInfo,
//       user: user,
//       totalCardAmout: totalCardAmout,
//       paymentLink: response.data,
//     });
//   } catch (error) {
//     console.error(error.response?.data || error.message);

//     return res.status(500).json({
//       success: false,
//       message: "Payment request failed",
//       error: error.response?.data || error.message,
//     });
//   }
// };



const axios = require("axios");
const Cart = require("../models/cardModel");
const Order = require("../models/orderModel");
const { calculateDelivery, httpError } = require("../utils/deliveryCharge");
const mongoose = require("mongoose");

// old

// exports.singletOrder = async (req, res) => {
//   const { id } = req.params

//   try {
//     const order = await Order.find({ _id: id });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: 'Order not found'
//       })
//     }

//     return res.status(200).json({
//       success: true,
//       message: 'Order',
//       order: order
//     })
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     })
//   }
// }

// exports.allOrder = async(req, res) => {
//   try {
//     const order = await Order.find({});

//     return res.status(200).json({
//       success: false,
//       message: 'Fetching all Order successfully',
//       order
//     });

//   } catch (error) {
//       return res.status(500).json({
//       success: false,
//       message: 'Server Error',
//       error: error.message
//     })
//   }
// }




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
  const rand = Math.floor(Math.random() * 900 + 100); // 3 digit
  return `${name.replace(/\s/g, "").slice(0, 2)}${ts.slice(-5)}Eco${rand}`;
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
      success_url: process.env.PAYMENT_SUCCESS_URL || "http://www.merchantdomain.com/successpage.html",
      fail_url: process.env.PAYMENT_FAIL_URL || "http://www.merchantdomain.com/failedpage.html",
      cancel_url: process.env.PAYMENT_CANCEL_URL || "http://www.merchantdomain.com/cancelpage.html",
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