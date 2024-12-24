const mongoose = require("mongoose");
const colors = require("colors");
const connectDb = async () => {
  // console.log("oka")
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDb connected... and Running On ${mongoose.connection.host}`.bgCyan.white);
  } catch (error) {
    console.log(`${error}`.bgRed);
  }
};

module.exports = connectDb;
