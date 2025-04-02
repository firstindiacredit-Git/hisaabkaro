const mongoose = require("mongoose");
const colors = require("colors");

const connectDb = async () => {
  try {
    // Add connection options for better reliability
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10,
      heartbeatFrequencyMS: 2000,
    };

    // Log the connection attempt
    console.log("Attempting to connect to MongoDB...".yellow);

    // Connect with options
    const conn = await mongoose.connect(process.env.MONGO_URL, options);

    // Log successful connection
    console.log(
      `MongoDB connected successfully and running on ${conn.connection.host}`
        .bgCyan.white
    );

    // Return the connection for promise chaining
    return conn;
  } catch (error) {
    // Enhanced error logging
    console.error("MongoDB connection error:".bgRed);
    console.error("Error details:".red, {
      name: error.name,
      message: error.message,
      code: error.code,
      codeName: error.codeName,
    });

    // Throw the error to be handled by the caller
    throw error;
  }
};

module.exports = connectDb;
