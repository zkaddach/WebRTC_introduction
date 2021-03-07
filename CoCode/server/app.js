const express = require('express');
const app = express();
let http = require('http').Server(app);

const port = process.env.PORT || 3000;

let io = require('socket.io')
app.use(express.static('public'));


module.exports = app;
