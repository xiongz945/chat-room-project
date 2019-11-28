import userApis from '../../../apis/user-apis.js';
import chatroomApis from '../../../apis/chatroom-apis.js';
import userStore from '../../../store/user.js';
import { appendUserList } from './content-updaters.js';
import { statusMap } from '../config.js';
import { socket } from '../chatroom.js';

export async function logout() {
  return await userApis.logout();
}

export async function setUserStatus(status) {
  return await userApis.patchUserStatus(status);
}

export async function setUserIsOnline(isOnline) {
  return await userApis.patchUserIsOnline(isOnline);
}

export async function getAllUserInfo() {
  try {
    const response = await chatroomApis.getPublicUsers();
    let users = response['data']['users'];
    users = users.sort((a, b) => b.isOnline - a.isOnline);

    users.forEach((user) => {
      // display current user's status on the left side menu
      // store current status in local storage
      if (user['username'] === userStore.userGetters.user().username) {
        const status = user['status'];
        userStore.userActions.updateStatus(status ? status : 'undefined');
        document.querySelector('#statusSelect').value = status
          ? Object.keys(statusMap).find((key) => statusMap[key] === status)
          : 'Choose Your Status';
      }
      appendUserList(user);
    });
    socket.emit('NOTIFY_USER_LOGIN', userStore.userGetters.user().username);
  } catch (e) {
    console.log(e);
  }
}
