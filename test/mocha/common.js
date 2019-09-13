const {SERVER_CONFIG} = require('../../src/util/constants.js');

const socketIO = require('socket.io');
const socketClient = require('socket.io-client');
const p2pServerPlugin = require('../../src/p2p-server-plugin');
const p2pClientPlugin = require('../../src/p2p-client-plugin');
const http = require('http');

let httpServer;
let io;

module.exports.startServer = function () {
  httpServer = http.createServer((req, res) => res.end()).listen(SERVER_CONFIG.PORT);
  io = socketIO.listen(httpServer);
  return p2pServerPlugin(io);
}

module.exports.stopServer = function () {
  httpServer.close();
}

module.exports.startClient = function (client, clientId) {
  const io = socketClient.connect(`http://localhost:${SERVER_CONFIG.PORT}?clientId=${clientId}`);
  return p2pClientPlugin(io, clientId);
}
