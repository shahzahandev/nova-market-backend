require('dotenv').config();
require('node:dns/promises').setServers(['1.1.1.1','8.8.8.8']);
const cors = require('cors');
const express = require('express');
const app = express();

const dbConnection = require('./src/config/dbConnection');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const path = require('path');


// <==== middleware ====>
app.use(express.json({ limit: '10kb' }));

const allowedOrigins = [
  "http://localhost:5173",
  "https://nova-market-frontend.vercel.app",
  "http://localhost:5174"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// <==== Database connetion =====>
dbConnection();

// <==== Rotue =====>
app.use('/api/v1/auth', authRoutes);   // checked
app.use('/api/v1/user', userRoutes);   // checked
app.use('/api/v1/product', productRoutes);  // checked
app.use('/api/v1/cart', cartRoutes);   // checked
app.use('/api/v1/order', orderRoutes);  // checked


// app.use("/upload", express.static(path.join(__dirname, "upload")));
app.use('/upload', express.static(path.join(__dirname, 'src/upload')));


// <==== PORT ====> 
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});