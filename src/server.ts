import errorHandler from 'errorhandler';
import socket from 'socket.io';

import app from './app';

import { User, IUserDocument } from './models/User';

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
const socketIDtoName: Record<string, string> = {};

// // Add log for io connection
io.on('connection', function(socket: any) {
  console.log(`SOCKET CONNECTED: ${socket.id}`);

  // FIXME: Need to refactor this snippet.
  socket.on('REGISTER', function(username: string) {
    sockets[username] = socket;
    socketIDtoName[socket.id] = username;
    console.log(`USER RECORDED: ${socket.id} - ${username}`);
  });

  socket.on('PUSH_NEW_MESSAGE', function() {
    io.emit('PULL_NEW_MESSAGE', 'public');
  });

  socket.on('PUSH_NEW_PRIVATE_MESSAGE', function(payload: any) {
    socket.emit('PULL_NEW_PRIVATE_MESSAGE', payload);
    const senderName = payload['senderName'];
    const receiverName = payload['receiverName'];
    if (receiverName in sockets && senderName !== receiverName) {
      sockets[receiverName].emit('PULL_NEW_PRIVATE_MESSAGE', payload);
    }
  });

  socket.on('PUSH_NEW_STATUS_CHECK', function() {
    io.emit('PULL_NEW_STATUS_CHECK', 'status_check');
  });

  socket.on('NOTIFY_USER_LOGIN', function(username: String) {
    io.emit('USER_LOGIN', username);
  });

  socket.on('NOTIFY_USER_LOGOUT', function(username: String) {
    io.emit('USER_LOGOUT', username);
  });

  socket.on('NOTIFY_STATUS_UPDATE', function(updateDetails: any) {
    io.emit('STATUS_UPDATE', updateDetails);
  });

  socket.on('NOTIFY_NEW_ANNOUNCEMENT', function(announcment: String) {
    io.emit('NEW_ANNOUNCEMENT', announcment);
  });

  socket.on('NOTIFY_NEW_PREDICTION', function(prediction: any) {
    console.log(prediction);
    io.emit('NEW_PREDICTION', prediction);
  });
  socket.on('disconnect', async function() {
    const username = socketIDtoName[socket.id];
    delete socketIDtoName[socket.id];

    if (username) {
      delete sockets[username];
      try {
        const user = await User.findOne({ username }).exec();
        await user.updateOne({ isOnline: false }).exec();
      } catch (error) {
        console.log(error);
      }
      io.emit('USER_LOGOUT', username);
      console.log(`SOCKET DISCONNECTED: ${socket.id} - ${username}`);
    }
  });
});
