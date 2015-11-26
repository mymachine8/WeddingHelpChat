var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var fs = require('fs');
var port = process.env.PORT || 5000;
server.listen(port);
require('./config')(app, io);
require('./routes')(app, io);

