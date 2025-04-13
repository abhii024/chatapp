import express from "express"
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from './routes/authRoutes.js';
import http from 'http';
import { Server } from 'socket.io';


dotenv.config();
connectDB();

const app = express()



app.use(cors());
app.use(express.json());


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL, 
    methods: ["GET", "POST"],
  },
});



io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Middleware
app.use(express.json());
app.use(cors());
app.use('/api', authRoutes);
app.get("/", (req, res) => {
  res.json({ msg: "hello" })
})

const PORT = process.env.REACT_APP_BACKEND_PORT || 5001;
app.listen(PORT, () => {
  console.log(`server is runnig on $http://localhost:${PORT}`)
})
export { io };