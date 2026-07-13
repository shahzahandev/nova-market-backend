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


// <==== middleware ====>
app.use(express.json());
app.use(cors());

// <==== Database connetion =====>
dbConnection();

// <==== Rotue =====>
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/order', orderRoutes);

// <==== PORT ====> 
const port = process.env.PORT || 5000
app.listen(port, (req, res) => {
    console.log(`Server is running on port ${port}`);
});