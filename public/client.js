const ws = new WebSocket('ws://localhost:3001');

ws.addEventListener('open', function (e) {
  console.log("Connected!");
})

const rowDiv = document.createElement("div");

const dummyDiv = document.createElement("div");
dummyDiv.classList.add("col-2");

const chatWidgetDiv = document.createElement("div");
chatWidgetDiv.classList.add("chatWidget");
chatWidgetDiv.classList.add("col");

rowDiv.appendChild(dummyDiv);
rowDiv.appendChild(chatWidgetDiv);

const contentDiv = document.getElementById("content");
contentDiv.appendChild(rowDiv);

ws.addEventListener('message', function (payload) {
  const message = JSON.parse(payload.data);
  console.log(message);
  if (message.type === 'chatMessage') {
    const chatMessage = message.message;
    chatWidgetDiv.innerHTML += "<div><b>" + chatMessage.sender + "</b>: " + chatMessage.message + "</div>";
  }
});
