import Message from "../models/Message.js";
import User from "../models/User.js";
import { io } from "../index.js";
const sendMessage = async (req, res) => {
    try {
        const { senderId, content } = req.body;


        const sender = await User.findById(senderId);

        // if (!sender || sender.role !== "admin") {
        //   return res.status(403).json({ error: "Only admin can send messages." });
        // }

        let recipients = [];

        // Mention parsing: @username1 @username2
        const mentions = content.match(/@\w+/g);
        if (mentions) {
            const usernames = mentions.map(m => m.slice(1));
            const users = await User.find({ name: { $in: usernames } });
            recipients = users.map(u => u._id);
        }

        const message = new Message({
            sender: sender._id,
            content,
            recipients: recipients.length > 0 ? recipients : [], // empty = send to all
        });

        await message.save();

        io.emit("newMessage", {
            _id: message._id,
            sender: {
                _id: sender._id,
                name: sender.name,
                profileImage: sender.profileImage,
            },
            content,
            recipients,
            createdAt: message.createdAt,
        });

        res.status(201).json({ message });
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ error: "Server error." });
    }
};

const getMessagesForUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { recipients: { $exists: true, $size: 0 } },
                { recipients: userId },
                { sender: userId },
            ],
        }).populate("sender", "name profileImage");

        res.json({ messages });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages." });
    }
};


export { sendMessage, getMessagesForUser };
