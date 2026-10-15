import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/product.model.js';

dotenv.config();

const sampleProducts = [
  {
    name: 'Wireless Noise Cancelling Headphones',
    description: 'High-fidelity audio with active noise cancellation, 30-hour battery life, and comfortable over-ear design.',
    price: 4999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
    stock: 25
  },
  {
    name: 'Smart Fitness Watch',
    description: 'Comprehensive health tracking including heart rate, SpO2, sleep monitoring, and multi-sport workout modes.',
    price: 2999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    stock: 18
  },
  {
    name: 'Classic Leather Backpack',
    description: 'Handcrafted genuine leather backpack with dedicated 15-inch laptop sleeve and water-resistant finish.',
    price: 3499,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    stock: 12
  },
  {
    name: 'Cotton Casual Henley Shirt',
    description: 'Breathable 100% organic cotton Henley with relaxed tailored fit and durable button closure.',
    price: 1299,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    stock: 40
  },
  {
    name: 'Modern Ceramic Coffee Mug Set',
    description: 'Set of 4 matte stoneware coffee mugs designed for ergonomic grip and microwave/dishwasher safety.',
    price: 899,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
    stock: 30
  },
  {
    name: 'Minimalist Desk Lamp',
    description: 'Adjustable LED desk lamp with dimmable touch controls, warm-to-cool color temperatures, and USB charging port.',
    price: 1899,
    category: 'Home',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80',
    stock: 15
  },
  {
    name: 'The Pragmatic Programmer: 20th Anniversary Edition',
    description: 'Essential software craftsmanship guide covering modern software engineering and coding paradigms.',
    price: 1599,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
    stock: 20
  },
  {
    name: 'Designing Data-Intensive Applications',
    description: 'Deep architectural principles and patterns for building reliable, scalable, and maintainable systems.',
    price: 2199,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=600&auto=format&fit=crop&q=80',
    stock: 14
  }
];

async function seedData() {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    console.error('Error: MONGO_URI is missing in .env');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');

    const count = await Product.countDocuments();
    if (count > 0) {
      console.log(`Database already has ${count} products.`);
      const answer = process.argv.includes('--force');
      if (answer) {
        await Product.deleteMany({});
        console.log('Cleared existing products (--force used).');
      } else {
        console.log('To overwrite, run with --force. Skipping seeding.');
        await mongoose.disconnect();
        return;
      }
    }

    await Product.insertMany(sampleProducts);
    console.log(`Successfully seeded ${sampleProducts.length} sample products!`);
    await mongoose.disconnect();
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  }
}

seedData();
