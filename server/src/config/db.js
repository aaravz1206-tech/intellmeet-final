import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intellmeet';
  
  try {
    mongoose.set('strictQuery', false);
    console.log('Connecting to MongoDB at:', mongoUri);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('======================================================');
    console.log('🟢 MongoDB Connected Successfully 🟢');
    console.log('======================================================');
  } catch (error) {
    console.error('======================================================');
    console.error('⚠️  MongoDB Connection Failed: ', error.message);
    console.error('FATAL: Application requires MongoDB to run. Exiting.');
    console.error('======================================================');
    process.exit(1);
  }
};
