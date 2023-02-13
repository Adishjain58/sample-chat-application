const socket = io();

let userNameInput = document.getElementById("name");
let errorContainer = document.getElementById("error-container");

let user;

const sendMessage = () => {
  let message = document.getElementById("message").value;
  if (message) {
    socket.emit("stopTyping", user);
    socket.emit("msg", { message, user });
    document.getElementById("message").value = "";
  } else {
    alert("Please enter a message");
  }
};

const setUserName = (e) => {
  let userName = userNameInput.value;
  if (!userName) {
    alert("Please enter a username");
  } else {
    socket.emit("setUserName", userName);
  }
};

const typing = (e) => {
  var code = e.keyCode ? e.keyCode : e.which;
  if (code == 13) {
    sendMessage();
  }
  if (user) {
    socket.emit("typing", user);
  }
};

const updateNoOfUsers = (data) => {
  let users = Object.keys(data);
  if (users.length > 0 && user) {
    document.getElementById(
      "users"
    ).innerHTML = `Users present in chat are ${users}`;
  } else {
    document.getElementById(
      "users"
    ).innerHTML = `No of users present in chat : ${users.length}`;
  }
};

socket.on("userExists", (message) => {
  errorContainer.innerHTML = message;
});

socket.on("userConnected", (data) => {
  updateNoOfUsers(data.usersMapping);
  if (user) {
    document.getElementById("message-container").innerHTML +=
      "<div><b>" + data.message + "</div>";
  }
});

socket.on("userSet", (data) => {
  user = data.userName;
  document.getElementById("userContainer").innerHTML =
    '<input type="text" id="message" placeholder="Please enter your message" onkeyup="typing(event)">\
         <button type="button"  name="button" onclick="sendMessage()">Send</button>\
         ';

  let message = document.getElementById("message");
  // code to remove typing message when focus is moved out of input
  if (message) {
    message.addEventListener("focusout", () => {
      if (user) {
        socket.emit("stopTyping", user);
      }
    });

    message.addEventListener("focusin", () => {
      if (user) {
        socket.emit("typing", user);
      }
    });
  }
});

socket.on("userTyping", (data) => {
  if (user) {
    const id = data.user.replace(/[ ]/gi, "-");
    if (!document.querySelector(`#typing-container #${id}`))
      document.getElementById(
        "typing-container"
      ).innerHTML += `<div id='${id}'><b>${data.message}</b></div>`;
  }
});

socket.on("newMsg", (data) => {
  if (user) {
    document.getElementById("message-container").innerHTML +=
      "<div><b>" + data.user + "</b>: " + data.message + "</div>";
  }
});

socket.on("typingStopped", (userName) => {
  const typingElement = document.querySelector(
    `#typing-container #${userName.replace(/[ ]/gi, "-")}`
  );
  if (typingElement) {
    typingElement.remove();
  }
});

socket.on("userDisconnected", (data) => {
  updateNoOfUsers(data.usersMapping);
  if (user) {
    document.getElementById("message-container").innerHTML +=
      "<div><b>" + `${data.userName} left the chat` + "</div>";
  }
});

socket.on("usersPresent", (data) => {
  updateNoOfUsers(data);
});
