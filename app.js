const express = require("express");

const app = express();
const http = require("http");

app.use(express.static(__dirname));

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

let usersMapping = {};

io.on("connection", (socket) => {
  socket.on("chat-message", (message) => {
    console.log("Message received", message);
    io.emit("chat-message", message);
  });

  socket.emit("usersPresent", usersMapping);

  socket.on("disconnect", () => {
    console.log("disconnected");
    let userName;
    Object.entries(usersMapping).forEach(([key, value]) => {
      if (value === socket.id) {
        userName = key;
      }
    });
    if (userName) {
      delete usersMapping[userName];
      io.sockets.emit("userDisconnected", { usersMapping, userName });
    }
  });

  socket.on("setUserName", (userName) => {
    if (usersMapping[userName]) {
      socket.emit("userExists", "You are already joined in this chat");
    } else {
      usersMapping[userName] = socket.id;
      socket.emit("userSet", { userName });
      // socket.broadcast.emit("userConnected", `${userName} joined the chat`);
      io.sockets.emit("userConnected", {
        usersMapping,
        message: `${userName} joined the chat`,
      });
      // }
    }
  });

  socket.on("msg", (data) => {
    console.log("msg", data);
    io.sockets.emit("newMsg", data);
  });

  socket.on("typing", (user) => {
    socket.broadcast.emit("userTyping", {
      user,
      message: `${user} is typing...`,
    });
  });

  socket.on("stopTyping", (user) => {
    socket.broadcast.emit("typingStopped", user);
  });
});

server.listen(3000, () => {
  console.log("Listening on port 3000");
});
