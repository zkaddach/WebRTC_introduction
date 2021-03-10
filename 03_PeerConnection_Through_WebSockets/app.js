const express = require('express');
const app = express();
var fs = require('fs');

var https = require('https');

// Public Self-Signed Certificates for HTTPS connection
var privateKey  = fs.readFileSync('./certificates/key.pem', 'utf8');
var certificate = fs.readFileSync('./certificates/cert.pem', 'utf8');

var credentials = {key: privateKey, cert: certificate};
var httpsServer = https.createServer(credentials, app);


let io = require('socket.io')(httpsServer);

app.use(express.static('public'));

var LANAccess = "0.0.0.0";
httpsServer.listen(8443, LANAccess, () => {
    console.log("Listening on " + LANAccess + ":" + 8443);
});



io.on('connection', socket => {
  console.log("A user connected");
  socket.emit("newUser", "Coucou user :  " + socket.id)

  socket.on("offer", ({offer, to}) => {
    console.log("Server received offer : ", to)
    socket.to(to).emit("offer", {offer, from: socket.id})
  })

  socket.on("candidate", ({candidate, to}) => {
    console.log("Server received candidate, transmitting to : ", to)
    socket.to(to).emit("candidate", {candidate, from: socket.id})
  })

  socket.on("answer", ({answer, to}) => {
    console.log("Server received answer : ", to)
    socket.to(to).emit("answer", {answer, from: socket.id})
  })
})
