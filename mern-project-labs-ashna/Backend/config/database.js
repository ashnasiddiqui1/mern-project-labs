import mongoose from 'mongoose';

export async function connectDatabase() {
  const connectionUri = process.env.MONGO_URI;

  if (!connectionUri) {
    console.warn('Warning: MONGO_URI is not defined in environment variables.');
  }

  try {
    const conn = await mongoose.connect(connectionUri);
    console.log(`Database connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error('Database connection failed:', err.message);
    throw err;
  }
}
