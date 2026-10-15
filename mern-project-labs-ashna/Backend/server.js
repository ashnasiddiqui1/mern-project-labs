import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database.js';

import customerRoutes from './routes/customer.routes.js';
import productRoutes from './routes/product.routes.js';
import wishlistRoutes from './routes/wishlist.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8002;

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());

// Application API routes
app.use('/customers', customerRoutes);
app.use('/products', productRoutes);
app.use('/wishlist', wishlistRoutes);
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'ShopKart API is running'
  });
});

// Database connection & Server initialization
if (process.env.NODE_ENV !== 'test') {
  connectDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Failed to initialize server due to database connection issue:', err.message);
    });
}

export default app;
