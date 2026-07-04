const axios = require('axios');
const Cart = require("../models/cardModel");
const Order = require('../models/orderModel');

const paymentController = async (req, res) => {

  const { userId, cus_name, cus_email, cus_add1, cus_add2, cus_city, cus_state, cus_postcode, cus_phone } = req.body

  try {
    const card = await Cart.find({ user: userId }).populate('user product')

    let totalCardAmout = 0;
    let productInfo = [];
    card.map(item => {
      productInfo.push({
        title: item.product.titile,
        price: item.product.price,
        discountPrice: item.product.discountPrice,
        sku: item.product.sku,
        stock: item.product.stock,
        category: item.product.category,
        tag: item.product.tag,
        status: item.product.status,
        quantity: item.quantity,
        totalPrice: item.totalPrice
      })

      user = item.user
      totalCardAmout += item.totalPrice
    });

    // create a Random transaction Id
    let firstThreeletter = cus_name.slice(0, 2)
    let randomNumber = Date.now().toString()
    let randomNumber2 = Date.now().toString();
    let ecoName = 'Eco';
    let tranId = firstThreeletter + randomNumber.slice(-5) + ecoName + randomNumber2.slice(-3);


    const payload = {
      store_id: "aamarpaytest",
      tran_id: tranId,
      success_url: "http://www.merchantdomain.com/successpage.html",
      fail_url: "http://www.merchantdomain.com/failedpage.html",
      cancel_url: "http://www.merchantdomain.com/cancelpage.html",
      currency: "BDT",
      signature_key: "dbb74894e82415a2f7ff0ec3a97e4183",
      desc: "Merchant Registration Payment",
      amount: totalCardAmout,
      cus_name: cus_name,
      cus_email: cus_email,
      cus_add1: cus_add1,
      cus_add2: cus_add2,
      cus_city: cus_city,
      cus_state: cus_state,
      cus_postcode: cus_postcode,
      cus_phone: cus_phone,
      type: "json",
      cus_country: "Bangladesh",
    };

    // Order saving process
    const order = new Order({
      user: userId,
      products: productInfo,
      totalPrice: totalCardAmout,
      tranId: tranId
    });
    await order.save();


    const response = await axios.post(
      "https://sandbox.aamarpay.com/jsonpost.php",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return res.status(200).json({
      success: true,
      products: productInfo,
      user: user,
      totalCardAmout: totalCardAmout,
      paymentLink: response.data,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    return res.status(500).json({
      success: false,
      message: "Payment request failed",
      error: error.response?.data || error.message,
    });
  }
};

// Getting order
const getOrder = async (req, res) => {
  const { id } = req.params

  try {
    const order = await Order.find({ _id: id });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Order',
      order: order
    })
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    })
  }
}


module.exports = { paymentController, getOrder }