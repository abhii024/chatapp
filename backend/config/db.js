import mongoose from 'mongoose';
import dotenv from "dotenv";
import User from '../models/User.js'; // Importing User model

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
    
    // Check if a user already exists, if not, create demo data
    const userExists = await User.findOne({ name: "demoUser" });
    if (!userExists) {
      const demoUser = new User({
        name: "demoUser",
        password: "demoPassword",  // In a real app, use hashed passwords
        email:"abhi@gmail.com",
      });
      await demoUser.save();
      console.log('Demo user created');
    } else {
      console.log('Demo user already exists');
    }

  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

export default connectDB;
