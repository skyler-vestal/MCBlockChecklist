var express = require('express');
var app = express();
var server = app.listen(3000);
var fs = require('fs');

app.use(express.static('sketch'));

var socket = require('socket.io');
var io = socket(server);

io.sockets.on('connection', function(socket) {
  console.log('new connection: ' + socket.id);

  socket.on('sendCheck', checkMsg);
  socket.on('saveChecks', saveData);

  function checkMsg(data) {
    console.log(String(socket.id) + ': ' + String(data));
    socket.broadcast.emit('takeCheck', data);
  }

  function saveData(data) {
    fs.writeFile('sketch/resources/check.data', data, (err) => {
      if (err) throw err;
    });
  }
});
