import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Fallback in-memory database storage if MongoDB is not running
global.mockDb = {
  users: [],
  meetings: [],
  tasks: [],
  messages: [],
  files: []
};
global.isMockDB = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/intellmeet';
  
  try {
    mongoose.set('strictQuery', false);
    console.log('Connecting to MongoDB at:', mongoUri);
    
    // Set a timeout of 3 seconds for fast fallback
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000
    });
    
    console.log('======================================================');
    console.log('🟢 MongoDB Connected Successfully (Industry Mode) 🟢');
    console.log('======================================================');
  } catch (error) {
    console.log('======================================================');
    console.log('⚠️  MongoDB Connection Failed: ', error.message);
    console.log('⚡ FALLING BACK TO IN-MEMORY DATABASE FOR ZERO-FRICTION RUN ⚡');
    console.log('⚙️  All API operations will run in-memory and remain fully functional.');
    console.log('======================================================');
    if (process.env.NODE_ENV === 'production') {
      console.error('FATAL: In-memory fallback is disabled in production to prevent data loss. Exiting.');
      process.exit(1);
    }
    global.isMockDB = true;
  }
};
