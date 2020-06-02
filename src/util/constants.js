module.exports.SOCKET_EVENT = Object.freeze({
  // Core API events
  CHECK_TOPIC_NAME: 'CHECK_TOPIC_NAME',
  CREATE_TOPIC: 'CREATE_TOPIC',
  DESTROY_TOPIC: 'DESTROY_TOPIC',
  JOIN_ROOM: 'JOIN_ROOM',
  LEAVE_ROOM: 'LEAVE_ROOM',
  EMIT_ROOM: 'EMIT_ROOM',
  // Message API events
  P2P_EMIT: 'P2P_EMIT',
  P2P_REGISTER: 'P2P_REGISTER',
  P2P_UNREGISTER: 'P2P_UNREGISTER',
  LIST_CLIENTS: 'LIST_CLIENTS',
  SERVER_ERROR: 'SERVER_ERROR',
  // Stream API events
  P2P_REGISTER_STREAM: 'P2P_REGISTER_STREAM',
  P2P_EMIT_STREAM: 'P2P_EMIT_STREAM',
  // Message API events
  ADD_TARGET: 'ADD_TARGET',
  TARGET_DISCONNECT: 'TARGET_DISCONNECT',
  CLIENT_IDENTIFIER_PREFIX: '-from-client-',
  // Multi-target Stream API events
  CREATE_STREAM: 'CREATE_STREAM',
  PEER_STREAM_DESTROYED: 'PEER_STREAM_DESTROYED',
  STREAM_IDENTIFIER_PREFIX: '-from-stream-',
  // Service API
  CHECK_API_NAME: 'CHECK_API_NAME',
  CREATE_API: 'CREATE_API',
  DESTROY_API: 'DESTROY_API',
  USE_API: 'USE_API',
  SUBSCRIBE_TOPIC: 'SUBSCRIBE_TOPIC',
  UNSUBSCRIBE_TOPIC: 'UNSUBSCRIBE_TOPIC',
  DEFAULT_TOPIC_EVENT: 'DEFAULT_TOPIC_EVENT',
  TOPIC_BEING_DESTROYED: 'TOPIC_BEING_DESTROYED',
});

module.exports.SERVER_CONFIG = Object.freeze({
  IP_ADDRESS: 'localhost',
  PORT: 9001,
  SERVER_SIDE_SOCKET_ID_POSTFIX: '--server-side',
});

module.exports.INTERNAL_EMITTER_EVENT = Object.freeze({
  DATA_FROM_ANOTHER_SERVER: 'DATA_FROM_ANOTHER_SERVER',
});

module.exports.REDIS_KEYS = Object.freeze({
  UPDATE_CLIENT_LIST_CHANNEL: 'UPDATE_CLIENT_LIST_CHANNEL',
  EMIT_TO_CHANNEL: 'EMIT_TO_CHANNEL',
  EMIT_TO_PERSISTENT_ACK_CHANNEL: 'EMIT_TO_PERSISTENT_ACK_CHANNEL',
  ACK_CHANNEL_PREFIX: 'ACK_FOR_SERVER_',
  REDIS_CLIENT_ID_KEY_PREFIX: 'clientId:',
});

module.exports.HOOK_NAME = Object.freeze({
  POST_EMIT_TO: 'POST_EMIT_TO',
  POST_EMIT_TO_PERSISTENT_ACK: 'POST_EMIT_TO_PERSISTENT_ACK',
});
