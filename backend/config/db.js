const mongoose = require('mongoose');

const connectDB = async (retries = 3, delay = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/reflect', {
        serverSelectionTimeoutMS: 10000
      });
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${retries} failed: ${error.message}`);
      if (attempt === retries) {
        process.exit(1);
      }
      console.log(`Retrying connection in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

module.exports = connectDB;
