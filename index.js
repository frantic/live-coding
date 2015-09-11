#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

function printHelpAndExit(exitCode) {
  console.error([
    'Usage: ' + __filename + ' [-p] <file-to-watch>',
    '',
    'Options:',
    '  -h, --help    Show this screen',
    '  -p, --public  Start ngrok proxy to let others connect to this server',
  ].join('\n'));
  process.exit(exitCode);
}

var fileName, allowPublicAccess;

process.argv.slice(2).forEach(function(arg) {
  if (arg == '-h' || arg == '--help') {
    printHelpAndExit(0);
  }
  if (arg == '-p' || arg == '--public') {
    allowPublicAccess = true;
  } else {
    fileName = arg;
  }
});

if (!fileName) {
  printHelpAndExit(1);
}

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

console.log('Serving ' + fileName + ' on http://localhost:3030/');

if (allowPublicAccess) {
  var ngrok = require('ngrok');
  ngrok.connect(3030, function (err, url) {
    console.log('Public URL:', url);
  });
}

app.use(express.static(path.join(__dirname, 'public')));
server.listen(3030);
