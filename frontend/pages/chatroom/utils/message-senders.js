import userStore from '../../../store/user.js';
import messageApis from '../../../apis/message-apis.js';
import { socket } from '../chatroom.js';

export async function sendPublicMessage(voice) {
  const status = userStore.userGetters.status();
  const newMessage = {
    senderName: userStore.userGetters.user().username,
    message: document.querySelector('#message').value,
    voice: voice ? voice : null,
    status: status ? status : 'undefined',
  };

  const newMessageFromData = new FormData();

  for (let key in newMessage) {
    newMessageFromData.append(key, newMessage[key]);
  }

  try {
    await messageApis.postPublicMessage(newMessageFromData);
    socket.emit('PUSH_NEW_MESSAGE');
  } catch (e) {
    console.log(e);
  }
}

export async function sendPrivateMessage(voice) {
  const peer = userStore.userGetters.chatPeer();
  const status = userStore.userGetters.status();

  const newMessage = {
    senderName: userStore.userGetters.user().username,
    receiverName: peer,
    message: document.querySelector('#message').value,
    voice: voice ? voice : null,
    status: status ? status : 'undefined',
  };

  const newMessageFromData = new FormData();

  for (let key in newMessage) {
    newMessageFromData.append(key, newMessage[key]);
  }

  try {
    const payload = {
      senderName: userStore.userGetters.user().username,
      receiverName: peer,
      timestamp: Date.now(),
    };
    await messageApis.postPrivateMessage(peer, newMessageFromData);
    socket.emit('PUSH_NEW_PRIVATE_MESSAGE', payload);
  } catch (e) {
    console.log(e);
  }
}

export async function sendAnnouncement(text) {
  const announcement = {
    senderName: userStore.userGetters.user().username,
    message: text,
  };
  try {
    await messageApis.postAnnouncement(announcement);
    socket.emit('NOTIFY_NEW_ANNOUNCEMENT', announcement);
  } catch (e) {
    console.log(e);
  }
}
