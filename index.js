var server = require('http').createServer(handleRequest);
var io = require('socket.io')(server);

function handleRequest(req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('OK');
}

server.listen(3000);
