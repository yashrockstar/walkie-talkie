var app = require("express")();
var http = require("http").Server(app);

var io = require("socket.io")(http);

var Usercounter = 0;
const map1 = new Map();
var username = [];

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

io.on("connection", function (socket) {
  Usercounter = Usercounter + 1;
  io.emit("user", Usercounter);
  console.log("start : "+socket.id);
  socket.on("disconnect", function () {
    console.log("end : "+socket.id);
    Usercounter = Usercounter - 1;
    io.emit("user", Usercounter);

    if(map1.has(socket.id)){
      var index = username.indexOf(map1.get(socket.id));
      if (index !== -1) {
        username.splice(index, 1);
      }
      socket.broadcast.emit("userleft",map1.get(socket.id));
    }

    console.log("user disconnected");
  });

  socket.on("audioMessage", function (obj) {
    socket.broadcast.emit("audioMessage", obj);
  });

  socket.on("textToSpeech", function (obj) {
    socket.broadcast.emit("textToSpeech", obj);
  });

  socket.on("username", function (msg) {
    if (!username.includes(msg.toLowerCase())) {
      username.push(msg.toLowerCase());
      map1.set(socket.id, msg.toLowerCase());
    }

    if (username.length > 0) {

      var obj = {
        "username" : username,
        "socketId" : socket.id,
        "newest" : msg.toLowerCase()
      }

      io.emit("username", obj);
    }
  });
});

http.listen(3000, function () {
  console.log("listening to port:3000");
});
