import errorHandler from 'errorhandler';
import socket from 'socket.io';

import app from './app';

import { Message, MessageDocument } from './models/Message';

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

// // Add log for io connection
io.on('connection', function(socket) {
  console.log(`SOCKET CONNECTED: ${socket.id}`);

  // FIXME: Need to refactor this snippet.
  socket.on('PUSH_NEW_MESSAGE', function() {
    io.emit('PULL_NEW_MESSAGE', 'public');
  });

  socket.on('NOTIFY_USER_LOGIN', function(username) {
    io.emit('USER_LOGIN', username);
  });

  socket.on('NOTIFY_USER_LOGOUT', function(username) {
    io.emit('USER_LOGOUT', username);
  });
});
