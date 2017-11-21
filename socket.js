/* jshint esversion: 6, node: true */
var { spawn } = require('child_process');

const ws = require('ws');

var videoStream = require('./stream.js');

module.exports = function(server) {
  var wss = new ws.Server({ server, perMessageDeflate: false });

  wss.on('connection', function (socket, req) {
    var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    console.log('WS', req.url, ip);

    var stream = videoStream.get();

    stream.on('data', chunk => {
      socket.send(chunk);
    });

    socket.on('error', err => {
      console.log('socket error', err);
    });

    socket.on('close', (code, msg) => {
      console.log('socket closed with', code, msg);
    });
  });
};
