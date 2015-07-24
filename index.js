var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.use(express.static(path.join(__dirname, 'public')));



function handleRequest(req, res) {
  fs.readFile(path.join(__dirname, 'index.html'), function(err, page) {
    if (err) {
      throw err; //1
    }

    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(page);
  });
  // x
}

var fileName = 'public/index.html';

function getSnapshot() {
  return {
    content: fs.readFileSync(fileName, 'utf8'),
    modifiedAt: fs.statSync(fileName).mtime.getTime(),
  };
}

var snapshots = [getSnapshot()];

io.on('connection', function (socket) {
  socket.emit('init', snapshots);
});

fs.watch(fileName, function() {
  var last = snapshots[snapshots.length - 1];
  var current = getSnapshot();
  if (current.content !== last.content) {
    io.emit('change', current);
    snapshots.push(current);
  }
})

console.log('Listening http://localhost:3000/');
server.listen(3000);
