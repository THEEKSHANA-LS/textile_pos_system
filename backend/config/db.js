const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // Not exiting immediately so it doesn't crash the server hard on startup if db isn't up, but typical behavior is exit
    // process.exit(1);
  }
};

module.exports = connectDB;
