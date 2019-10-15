import { IUserModel, User, IUserDocument } from '../models/User';

let _io: any;
const user_socket_id: any = {};

function Socket(io: any) {
  io.on('connection', async (socket: any) => {
    const username: string = socket.handshhake.session.username;
    console.log(`SOCKET CONNECTED: ${socket.id} with username ${username}`);

    if (socket.handshhake.session.username) {
      const user: IUserDocument = await User.findOne({ username }).exec();
      await user.setIsOnline(true);
      user_socket_id[username] = socket.id;
      io.emit('USER_LOGIN', username);
    }

    socket.on('disconnect', async () => {
      const username: string = socket.handshhake.session.username;
      console.log(
        `SOCKET DISCONNECTED: ${socket.id} with username ${username}`
      );

      if (socket.handshhake.session.username) {
        const user: IUserDocument = await User.findOne({ username }).exec();
        await user.setIsOnline(false);
        delete user_socket_id[username];
        io.emit('USER_LOGOUT', username);
      }
    });
  });
  _io = io;
}

export default {
  Socket,
  broadcast(msg: string) {
    _io.emit(msg);
  },
};

// // FIXME: Need to refactor this snippet.
// socket.on('PUSH_NEW_MESSAGE', function() {
//     io.emit('PULL_NEW_MESSAGE', 'public');
//   });

//   socket.on('NOTIFY_USER_LOGIN', function(username) {
//     io.emit('USER_LOGIN', username);
//   });

//   socket.on('NOTIFY_USER_LOGOUT', function(username) {
//     io.emit('USER_LOGOUT', username);
//   });
// });
