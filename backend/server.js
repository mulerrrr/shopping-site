require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

console.log(
  "API KEY LOADED:",
  process.env.ADDISPAY_API_KEY ? "YES" : "NO"
);

// =======================
// PRODUCTS
// =======================

const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    price: 1200,
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
  },
  {
    id: 2,
    name: "Smart Watch",
    price: 2500,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30"
  },
  {
    id: 3,
    name: "Running Shoes",
    price: 3200,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
  },
  {
    id: 4,
    name: "Backpack",
    price: 1800,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62"
  },
  {
    id: 5,
    name: "Sunglasses",
    price: 900,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083"
  },
  {
    id: 6,
    name: "T-Shirt",
    price: 700,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
  }
];

app.get("/api/products", (req, res) => {
  res.json(products);
});

// =======================
// ADDISPAY PAYMENT
// =======================

app.post("/api/payment/create", async (req, res) => {
  try {
    const {
      amount,
      email,
      firstName,
      lastName,
      phone
    } = req.body;

    console.log("Payment request:", req.body);

    if (
      !amount ||
      !email ||
      !firstName ||
      !lastName ||
      !phone
    ) {
      return res.status(400).json({
        message: "All payment fields are required"
      });
    }

    if (!process.env.ADDISPAY_API_KEY) {
      return res.status(500).json({
        message: "AddisPay API key is missing"
      });
    }

    const id = Date.now();

    const txRef = `order_${id}`;
    const nonce = `nonce_${id}`;

    const paymentData = {
      data: {
        redirect_url:
          "http://localhost:5173/payment-success",

        cancel_url:
          "http://localhost:5173/payment-cancel",

        success_url:
          "http://localhost:5173/payment-success",

        error_url:
          "http://localhost:5173/payment-error",

        order_reason: "Website payment",

        currency: "ETB",

        email: email,

        first_name: firstName,

        last_name: lastName,

        nonce: nonce,

        order_detail: {
          amount: Number(amount),
          description: "ShopEasy website payment"
        },

        phone_number: phone,

        session_expired: "5000",

        total_amount: String(amount),

        tx_ref: txRef
      },

      message: "Website payment"
    };

    console.log(
      "Sending payment to AddisPay..."
    );

    const response = await axios.post(
      "https://uat.api.addispay.et/checkout-api/v1/create-order",
      paymentData,
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Auth: process.env.ADDISPAY_API_KEY
        }
      }
    );

    console.log(
      "AddisPay response:",
      response.data
    );

    res.json(response.data);

  } catch (error) {
    console.error(
      "AddisPay error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Payment creation failed",

      error:
        error.response?.data ||
        error.message
    });
  }
});

// =======================
// TEST SERVER
// =======================

app.get("/", (req, res) => {
  res.json({
    message: "Shopping API is running"
  });
});

// =======================
// START SERVER
// =======================

const PORT = 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});