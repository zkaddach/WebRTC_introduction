const express = require('express');
const app = express();
var fs     = require('fs');

let  http = require('http').Server(app);
var https  = require('https');

// Public Self-Signed Certificates for HTTPS connection
var privateKey  = fs.readFileSync('./certificates/key.pem', 'utf8');
var certificate = fs.readFileSync('./certificates/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);

const port = process.env.PORT || 3000;


let io = require('socket.io')(http);

app.use(express.static('public'));

var LANAccess = "0.0.0.0";
httpsServer.listen(8443, LANAccess);
http.listen(port, () => {
  console.log("Listening on " + port);
})




io.on('connection', socket => {
  console.log("A user connected");
  socket.emit("newUser", "Coucou user :  " + socket.id)

  socket.on("offer", ({offer, to}) => {
    console.log("Server received offer : ", to)
    socket.to(to).emit("offer", {offer, from: socket.id})
  })

  socket.on("answer", ({answer, to}) => {
    console.log("Server received answer : ", to)
    socket.to(to).emit("answer", {answer, from: socket.id})
  })
  // socket.on('create or join', (room) => {
  //   console.log('Create or join the room ', room);
  //   const myRoom = io.sockets.adapter.rooms[room] || {length: 0};
  //   const numClients = myRoom.length;
  //   console.log(room, " has ", numClients, " clients");
  //
  //   if (numClients == 0) {
  //     socket.join(room);
  //     socket.emit('created', room);
  //   }
  //   else if (numClients == 1) {
  //     socket.join(room);
  //     socket.emit('joined', room);
  //   }
  //   else {
  //     socket.emit('full', room);
  //   }
  // })
  //
  // socket.on('ready', room => {
  //   socket.broadcast.to(room).emit('ready');
  // })
  //
  // socket.on('candidate', event => {
  //   socket.broadcast.to(room).emit('ready');
  // })
  //
  // socket.on('offer', event => {
  //   socket.broadcast.to(event.room).emit('offer', event.sdp);
  // })
  //
  // socket.on('answer', event => {
  //   socket.broadcast.to(room).emit('answer', event.sdp);
  // })
})
