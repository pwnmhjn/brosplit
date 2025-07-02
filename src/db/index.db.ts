import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}`
    );
    console.log(
      `\nMongoDB connected! DB Host: ${connectionInstance.connection.host}`
    );
  } catch (err) {
    console.log(`Error While Connecting to mongoDb ${err}`);
    process.exit(1);
  }
};

export default connectDB;
