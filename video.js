/* jshint esversion: 6, node: true */
const http = require('http');
var fs = require('fs');

const socketServer = require('./socket.js');

const port = 8889;

var server = http.createServer(function(req, res) {
  console.log(req.method, req.url);

  if (/homepage/.test(req.url)) {
    res.writeHead(200, { 'content-type': 'text/html' });
    return fs.createReadStream('./view.html').pipe(res);
  }

  res.writeHead(404);
  res.end();
});

socketServer(server);

server.listen(port);
