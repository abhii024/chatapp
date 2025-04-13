import React, { useEffect, useRef, useState } from "react";
import api from "../../api.js";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001"); // Replace with your backend URL

const DashboardPage = () => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const chatRef = useRef(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [mentionedUserIds, setMentionedUserIds] = useState([]);

  useEffect(() => {
    api
      .get("/getuser")
      .then((res) => {
        setUserId(res.data.id);
      })
      .catch((error) => {
        console.log("error", error);
      });
  }, []);

  useEffect(() => {
    if (!userId) return;
    api
      .get(`/user/${userId}`)
      .then((res) => {
        setMessages(res.data.messages);
      })
      .catch((error) => {
        console.log("error", error);
      });

    api
      .get(`/get-all-users`)
      .then((res) => {
        console.log("res", res.data);
        setAllUsers(res.data);
      })
      .catch((error) => {
        console.log("error", error);
      });

    socket.on("newMessage", (message) => {
      // Check if this message is public or for current user
      if (
        message.recipients.length === 0 ||
        message.recipients.includes(userId)
      ) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => {
      socket.off("newMessage");
    };
  }, [userId]);

  useEffect(() => {
    chatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    const data = new FormData();
    data.append("senderId", userId);
    data.append("content", text);

    api
      .post("/send-message", data)
      .then((res) => {
        console.log("res", res.data);
        setText("");
      })
      .catch((error) => {
        console.log("error", error);
      });
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    const mentionMatch = value.match(/@(\w*)$/); // Detect @mention at the end
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase();
      const filtered = allUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(query) &&
          !mentionedUserIds.includes(user._id) // avoid re-mentioning
      );
      setFilteredUsers(filtered);
      setShowUserList(true);
    } else {
      setShowUserList(false);
    }
  };


    const handleUserSelect = (user) => {
      const newText = text.replace(/@\w*$/, `@${user.name} `);
      setText(newText);
      setMentionedUserIds((prev) => [...prev, user._id]); // store user ID
      setShowUserList(false);
    };
  

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <div style={{ height: "90vh", overflowY: "scroll" }}>
        {messages.map((msg, i) => {
          const isOwn = msg.sender._id === userId;

          return (
            <div key={i}>
              <div
                style={{
                  backgroundColor: isOwn ? "gray" : "lightgray",
                  padding: "10px",
                  borderRadius: "10px",
                  margin: "5px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  flexDirection: isOwn ? "row-reverse" : "row",
                }}
              >
                <img
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                  }}
                  src={msg.sender.profileImage}
                  alt="avatar"
                />
                <div
                  className={`p-3 rounded-xl max-w-xs ${
                    isOwn
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  {!isOwn && (
                    <div className="text-sm font-semibold mb-1">
                      {msg.sender.name}
                    </div>
                  )}
                  <div>{msg.content}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatRef} />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          padding: "10px",
          borderRadius: "0 0 10px 10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
          left: 0,
          right: 0,
          margin: "0 auto",
          maxWidth: "90%",
          height: "10vh",
          backgroundColor: "transparent",
        }}
      >
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring"
            placeholder="Type a message..."
            value={text}
            onChange={handleChange}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "20px",
              border: "1px solid #eaeaea",
              boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              transition: "box-shadow 0.3s ease",
            }}
          />

          {showUserList && (
          <ul  
            style={{
              position: "absolute",
              bottom: "50px",
              left: 0,
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              width: "100%",
              zIndex: 10,
              maxHeight: "150px",
              overflowY: "auto",
            }}
          >
            {filteredUsers.map((user) => (
              <li
                key={user._id}
                onClick={() => handleUserSelect(user)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                @{user.name}
              </li>
            ))}
          </ul>
          )}
        </div>
        <button
          onClick={sendMessage}
          className="ml-2 bg-blue-600 text-black px-4 py-2 rounded-full hover:bg-blue-700"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
