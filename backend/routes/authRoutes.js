// backend/routes/authRoutes.js
import express, { Router } from 'express';
import { registerUser, authUser, getUserDetails, updateUserDetails, getAllUsers } from '../controllers/userController.js';
import { sendMessage, getMessagesForUser } from '../controllers/messageController.js';
import protect from '../middleware/authMiddleware.js'
import multer from 'multer';

// Multer setup
const storage = multer.memoryStorage(); // or use diskStorage if you want to store locally
const upload = multer({ storage });
const router = express.Router();

// Register route
// router.post('/register', registerUser);
router.post('/register', upload.single("image"), registerUser);

// Login route
router.post('/login', authUser);

router.get('/getuser', protect, getUserDetails);
router.get('/get-all-users', protect, getAllUsers);

router.put('/update-user', protect, updateUserDetails);

router.post('/send-message',protect, sendMessage);
router.get("/user/:userId",protect, getMessagesForUser);

export default router;
