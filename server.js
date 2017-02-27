var http = require("http");
var url = require('url');
var fs = require('fs');
var io = require('socket.io'); // 加入 Socket.IO
var MyServ= require('./MyServ');


var server = http.createServer();

server.listen(8123);

var serv_io = io.listen(server);
var roomList = {};


serv_io.sockets.on('connection', function (socket) {
   var myServ = new MyServ(socket,roomList);
    myServ.init();
});



