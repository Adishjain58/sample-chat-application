var socket = io();
var messages = document.getElementById("messages");
let form = document.getElementById("form");
let input = document.getElementById("input");
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat-message", input.value);
    input.value = "";
  }
});

socket.on("chat-message", (message) => {
  console.log("on ui", message);
  var item = document.createElement("li");
  item.textContent = message;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);
});

socket.on("userConnected", (message) => {
  console.log(message);
});
