import errorHandler from 'errorhandler';
import socket from 'socket.io';

import app from './app';

import { Message, IMessageDocument } from './models/Message';

/**
 * Error Handler. Provides full stack - remove for production
 */
app.use(errorHandler());

/**
 * Start Express server.
 */
const server = app.listen(app.get('port'), () => {
  console.log(
    '  App is running at http://localhost:%d in %s mode',
    app.get('port'),
    app.get('env')
  );
  console.log('  Press CTRL-C to stop\n');
});
export default server;

/**
 * Attach Socket to Server
 */
export const io = socket(server);

const sockets: Record<string, socket.Socket> = {};

// // Add log for io connection
io.on('connection', function(socket) {
  console.log(`SOCKET CONNECTED: ${socket.id}`);

  // FIXME: Need to refactor this snippet.
  socket.on('REGISTER', function(username: string) {
    sockets[username] = socket;
  });

  socket.on('PUSH_NEW_MESSAGE', function() {
    io.emit('PULL_NEW_MESSAGE', 'public');
  });

  socket.on('PUSH_NEW_PRIVATE_MESSAGE', function(payload) {
    socket.emit('PULL_NEW_PRIVATE_MESSAGE', payload);
    const senderName = payload['senderName'];
    const receiverName = payload['receiverName'];
    if (receiverName in sockets && senderName !== receiverName) {
      sockets[receiverName].emit('PULL_NEW_PRIVATE_MESSAGE', payload);
    }
  });

  socket.on('NOTIFY_USER_LOGIN', function(username) {
    io.emit('USER_LOGIN', username);
  });

  socket.on('NOTIFY_USER_LOGOUT', function(username) {
    io.emit('USER_LOGOUT', username);
  });

  socket.on('NOTIFY_STATUS_UPDATE', function(updateDetails) {
    io.emit('STATUS_UPDATE', updateDetails);
  });
});
