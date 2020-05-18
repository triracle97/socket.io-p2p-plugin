const {
  SOCKET_EVENT, SERVER_CONFIG: {SERVER_SIDE_SOCKET_ID_POSTFIX},
  HOOK_NAME: {POST_EMIT_TO, POST_EMIT_TO_PERSISTENT_ACK},
} = require('../../util/constants');
const findKey = require('lodash/findKey');
const EventEmitter = require('events');
const kareem = require('../../util/hooks');

class P2pServerCoreApi {
  constructor(io, options) {
    this.clientMap = {};
    this.io = io;
    this.ee = new EventEmitter();

    this.ackFunctions = {};
    this.saveMessage = options.saveMessage;
    this.deleteMessage = options.deleteMessage;
    this.loadMessages = options.loadMessages;
  }

  addClient(clientId, clientSocketId) {
    if (!clientId) throw new Error('clientId can not be null');

    // support client overwriting
    if (this.clientMap[clientId]) {
      const oldSocket = this.getSocketByClientId(clientId);
      if (oldSocket) {
        oldSocket.removeAllListeners();
        oldSocket.disconnect(true);
      }
    }

    this.clientMap[clientId] = clientSocketId;
  }

  removeClient(clientId) {
    delete this.clientMap[clientId];
  }

  getAllClientId() {
    return Object.keys(this.clientMap);
  }

  getClientIdBySocketId(socketId) {
    return findKey(this.clientMap, (v) => v === socketId);
  }

  getSocketIdByClientId(clientId) {
    return this.clientMap[clientId];
  }

  getSocketByClientId(clientId) {
    if (!this.clientMap[clientId]) return null;

    return this.io.sockets.connected[this.getSocketIdByClientId(clientId)];
  }

  // Socket-related functions
  emitError(socket, err) {
    console.error(`Error occurred on server: from client '${this.getClientIdBySocketId(socket.id)}': ${err}`);
    socket.emit(SOCKET_EVENT.SERVER_ERROR, err.toString());
  }

  emitTo(targetClientId, event, ...args) {
    const targetClientSocket = this.getSocketByClientId(targetClientId);

    if (!targetClientSocket) {
      if (kareem.hasHooks(POST_EMIT_TO)) {
        kareem.execPost(POST_EMIT_TO, null, [targetClientId, event, args], err => console.error(err));
      } else {
        console.error((`Client ${targetClientId} is not connected to server`));
      }
    } else {
      targetClientSocket.emit(event, ...args);
    }
  }

  emitToPersistent(targetClientId, event, args = [], ackFnName, ackFnArgs = []) {
    if (!args) args = [];
    if (!ackFnArgs) ackFnArgs = [];

    if (!Array.isArray(args)) args = [args];
    if (!Array.isArray(ackFnArgs)) ackFnArgs = [ackFnArgs];

    if (typeof this.saveMessage !== 'function' || typeof this.deleteMessage !== 'function' || typeof this.loadMessages !== 'function') {
      throw new Error('Missing saveMessage, deleteMessage and loadMessages functions, please provide them when you initialize server plugin');
    }

    (async () => {
      const messageId = await this.saveMessage(targetClientId, {event, args, ackFnName, ackFnArgs});

      if (!messageId) throw new Error('saveMessage function must return a message ID');

      args.push((...targetClientCallbackArgs) => {
        this.deleteMessage(targetClientId, messageId);

        const ackFunctions = this.ackFunctions[ackFnName] || [];
        ackFunctions.forEach(fn => fn(...(ackFnArgs.concat(targetClientCallbackArgs))));
      });

      this.emitTo(targetClientId, event, ...args);
    })()
  }

  registerAckFunction(name, fn) {
    this.ackFunctions[name] = this.ackFunctions[name] || [];
    this.ackFunctions[name].push(fn);
  }

  unregisterAckFunction(name, fn) {
    this.ackFunctions[name] = this.ackFunctions[name] || [];

    if (fn) {
      this.ackFunctions[name] = this.ackFunctions[name].filter(e => e !== fn);
    } else {
      delete this.ackFunctions[name];
    }
  }

  sendSavedMessages(targetClientId) {
    if (typeof this.loadMessages !== 'function' || typeof this.deleteMessage !== 'function') return;

    (async () => {
      const savedMessages = await this.loadMessages(targetClientId);

      if (!savedMessages || savedMessages.length === 0) return;
      savedMessages.forEach(({_id, event, args, ackFnName, ackFnArgs}) => {
        this.emitTo(targetClientId, event, ...args, (...targetClientCallbackArgs) => {
          this.deleteMessage(targetClientId, _id);

          const ackFunctions = this.ackFunctions[ackFnName] || [];

          if (ackFunctions.length > 0) {
            ackFunctions.forEach(fn => fn(...(ackFnArgs.concat(targetClientCallbackArgs))));
          } else {
            if (kareem.hasHooks(POST_EMIT_TO_PERSISTENT_ACK)) {
              kareem.execPost(POST_EMIT_TO_PERSISTENT_ACK, null, [ackFnName, ackFnArgs.concat(targetClientCallbackArgs)], () => {
              });
            }
          }
        });
      });
    })();
  }

  createListeners(io, socket, clientId) {
    socket.once('disconnect', () => {
      this.removeClient(clientId);
    });

    const p2pEmitListener = ({targetClientId, event, args}, acknowledgeFn) => {
      if (acknowledgeFn) args.push(acknowledgeFn); // if event === P2P_EMIT_ACKNOWLEDGE
      const targetClientSocket = this.getSocketByClientId(targetClientId);

      if (!targetClientSocket) {
        if (targetClientId.endsWith(SERVER_SIDE_SOCKET_ID_POSTFIX)) return; // server-side sockets are not added to client list -> ignore
        const error = new Error(`Could not find target client '${targetClientId}' socket`);

        if (kareem.hasHooks(POST_EMIT_TO)) {
          kareem.execPost(POST_EMIT_TO, null, [targetClientId, event, args], err => err & this.emitError(socket, error));
        } else {
          this.emitError(socket, error);
        }
      } else {
        targetClientSocket.emit(event, ...args);
      }
    };

    socket.on(SOCKET_EVENT.P2P_EMIT, p2pEmitListener);
    socket.on(SOCKET_EVENT.P2P_EMIT_ACKNOWLEDGE, p2pEmitListener);

    socket.on(SOCKET_EVENT.JOIN_ROOM, (roomName, callback) => {
      socket.join(roomName, callback);
    });
    socket.on(SOCKET_EVENT.LEAVE_ROOM, (roomName, callback) => {
      socket.leave(roomName, callback);
    });
    socket.on(SOCKET_EVENT.EMIT_ROOM, (roomName, event, ...args) => {
      socket.to(roomName).emit(event, ...args)
    });
  }

  initSocketBasedApis(socket) {
    // socket.on(SOCKET_EVENT.LIST_CLIENTS, clientCallbackFn => clientCallbackFn(this.getAllClientId()));
  }
}

module.exports = P2pServerCoreApi;
