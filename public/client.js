const ws = new WebSocket('ws://localhost:3001');

ws.addEventListener('open', function (e) {
  console.log("Connected!");
})

ws.addEventListener('message', function (message) {
  console.log("Received:", JSON.parse(message.data));
});
