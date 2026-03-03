import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment-specific .env file (override so tests never use .env's MONGO_URI)
if (process.env.NODE_ENV === 'test') {
  dotenv.config({ path: '.env.test', override: true });
}

const connectDB = async () => {
  try {
    const defaultDbName = process.env.NODE_ENV === 'test' 
      ? 'body-harmony-test' 
      : 'body-harmony';
    const mongoURI =
      process.env.MONGO_URI || `mongodb://127.0.0.1:27017/${defaultDbName}`;

    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB connected: ${mongoURI.replace(/\/\/.*@/, '//***@')}`);
    
    // Event listeners for connection
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      // MongoDB disconnected
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

export default connectDB;
