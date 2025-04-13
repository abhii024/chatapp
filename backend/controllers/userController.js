import asyncHandler from "express-async-handler";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import transporter from "../config/emailConfig.js";
import dotenv from 'dotenv';
import cloudinary from "../config/cloudinaryConfig.js";
import streamifier from 'streamifier';
dotenv.config()


const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password,role } = req.body;
  const image = req.file;

  if (!image) {
    res.status(400);
    throw new Error("Image is required");
  }
  console.log(" image", image);

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Upload image to Cloudinary
  const streamUpload = (buffer) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "user_profiles" },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  };

  let uploadResult;
  try {
    uploadResult = await streamUpload(image.buffer);
  } catch (err) {
    console.log("err", err)
    res.status(500);
    throw new Error("Image upload failed");
  }

  // Save user with image URL
  const user = await User.create({
    name,
    email,
    password,
    role,
    profileImage: uploadResult.secure_url, // <-- Save image URL
  });

  const info = await transporter.sendMail({
    from: `<${process.env.EMAIL_USER}>`,
    to: user.email, // replace with temp email or actual test address
    subject: `Hello user ${user.name}`,
    text: 'Wellcome to our platform!',
  });

  console.log("Message sent: %s", info);
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

const getUserDetails = async (req, res) => {
  const user = req.user;
  if (user) {
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};


const updateUserDetails = async (req, res) => {
  const user = req.user;

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    res.json({
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      // Add more fields as necessary
    });
  } else {
    res.status(404).json({ message: "User not found" });
  }
};


const getAllUsers = async (req, res) => {
  const id = req.user.id;
  const users = await User.find({ _id: { $ne: id } });
  res.json(users);
};
// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export { registerUser, authUser, getUserDetails, updateUserDetails, getAllUsers };
