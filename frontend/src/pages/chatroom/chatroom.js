import {API_ROOT} from '../../config.js';

import messageApis from '../../apis/message-apis.js';
import messageStore from '../../store/message.js';
import clockStore from '../../store/clock.js';

import userStore from '../../store/user.js';
import router from '../../router.js';
import userApis from '../../apis/user-apis.js';
import chatroomApis from '../../apis/chatroom-apis.js';

const statusMap = {
  1: 'OK',
  2: 'Help',
  3: 'Emergency'
};

const imgMap = {
  'OK': '../../assets/img/green.jpg',
  'Help': '../../assets/img/yellow.jpg',
  'Emergency': '../../assets/img/red.jpg',
  undefined : '../../assets/img/green.jpg'
};

// Set up Socket
const socket = io(API_ROOT);
socket.on('connect', function() {
  console.log('Socket connected');
});

socket.on('PULL_NEW_MESSAGE', function(id) {
  console.log(id);
  receivePublicMessage();
});

socket.on('USER_LOGIN', function(username) {
  updateChatUserIsOnline(username, true);
});

socket.on('USER_LOGOUT', function(username) {
  updateChatUserIsOnline(username, false);
});

socket.on('STATUS_UPDATE', function(updateDetails) {
  updateChatUserStatus(updateDetails['username'], updateDetails['status']);
});

socket.on('disconnect', function() {
  console.log('Socket disconnected');
});

// UI change based on user login status
if (userStore.userGetters.isLogin) {
  document.getElementById('join-community-button').style.display = 'none';
  document.getElementById('welcome-message').innerText = `Welcome, ${
    userStore.userGetters.user().username
  }!`;
  document.getElementById('logout-button').style.display = 'block';
}

// Bind event listener
document.getElementById('logout-button').onclick = async () => {
  socket.emit('NOTIFY_USER_LOGOUT', userStore.userGetters.user().username);
  await logout();
  window.onbeforeunload = undefined;
  userStore.userActions.logoutUser();
  router('login');
};

document.querySelector('#message').addEventListener('keypress', function(e) {
  const key = e.which || e.keyCode;
  if (key === 13) {
    // 13 is enter
    sendPublicMessage();

    e.preventDefault();
    this.value = '';
  }
});

document.getElementById('shareStatusBtn').onclick = async () => {
  closeMenu();
  const statusCode = document.getElementById('statusSelect').value;
  if (statusCode in statusMap) {
    const status = statusMap[statusCode];
    // the status remains the same actually
    console.log('update status to ' + status);
    await setUserStatus({status: status});
    socket.emit('NOTIFY_STATUS_UPDATE',
      {
        username: userStore.userGetters.user().username,
        status: status
      }
    );
    userStore.userActions.updateStatus(status);
  }
};

// Set user isOnline to false when page unloads
window.onbeforeunload = async (e) => {
  await logout();
};

// Set user isOnline field to 'true' when page is ready
setUserIsOnline({isOnline: true});

// Load history messages
receivePublicHistoryMessage();

// Get all users
getAllUserInfo();

// Function definations
async function receivePublicHistoryMessage() {
  // FIXME: Decide the number of messages to be loaded.
  const query = {
    start: 0,
    end: 10,
  };

  try {
    const response = await messageApis.getPublicHistoryMessage(query);
    const messages = response['data']['messages'];
    for (const index in messages) {
      updateMessageBoard(messages[index]);
    }

    clockStore.clockActions.updateClock(Date.now());
  } catch (e) {
    console.log(e);
  }
}

async function sendPublicMessage() {
  const newMessage = {
    senderName: userStore.userGetters.user().username,
    senderId: userStore.userGetters.user().id,
    message: document.querySelector('#message').value,
  };
  try {
    await messageApis.postPublicMessage(newMessage);
    socket.emit('PUSH_NEW_MESSAGE');
  } catch (e) {
    console.log(e);
  }
}

async function receivePublicMessage() {
  const query = {
    timestamp: clockStore.clockGetters.clock(),
  };

  try {
    const response = await messageApis.getPublicMessage(query);
    const messages = response['data']['messages'];
    for (const index in messages) {
      updateMessageBoard(messages[index]);
    }

    clockStore.clockActions.updateClock(Date.now());
  } catch (e) {
    console.log(e);
  }
}

async function getAllUserInfo() {
  try {
    const response = await chatroomApis.getPublicUsers();
    const users = response['data']['users'];
    for (const index in users) {
      const user = users[index];
      appendUserList(user);
    }

    socket.emit('NOTIFY_USER_LOGIN', userStore.userGetters.user().username);
  } catch (e) {
    console.log(e);
  }
}

async function logout() {
  return await userApis.logout();
}

async function setUserStatus(status) {
  return await userApis.patchUserStatus(status);
}

async function setUserIsOnline(isOnline) {
  return await userApis.patchUserIsOnline(isOnline);
}

function closeMenu(){
  let closeMenuBtn = document.getElementsByClassName(
    'close-canvas-menu'
  );
  if (closeMenuBtn.length === 0)
    return;
  closeMenuBtn[0].click();
}

function updateMessageBoard(data) {
  const chatMessage = document.createElement('div');
  if (userStore.userGetters.user().username === data['senderName']) {
    chatMessage.className = 'chat-message right';
  } else {
    chatMessage.className = 'chat-message left';
  }

  const messageAvatar = document.createElement('img');
  messageAvatar.className = 'message-avatar';
  messageAvatar.src = '/assets/img/avatar-default-icon.png';
  messageAvatar.alt = '';
  chatMessage.appendChild(messageAvatar);

  const message = document.createElement('div');
  message.className = 'message';

  const messageAuthor = document.createElement('a');
  messageAuthor.className = 'message-author';
  messageAuthor.innerText = data['senderName'];
  messageAuthor.href = '#';

  const messageDate = document.createElement('span');
  messageDate.className = 'message-date';
  // FIXME: Beautify the datetime.
  messageDate.innerHTML = data['createdAt'];

  const messageContent = document.createElement('span');
  messageContent.className = 'message-content';
  messageContent.innerText = data['content'];

  message.appendChild(messageAuthor);
  message.appendChild(messageDate);
  message.appendChild(messageContent);
  chatMessage.appendChild(message);

  const board = document.getElementById('message-board');
  board.appendChild(chatMessage);
  board.scrollTop = board.scrollHeight;
}

function appendUserList(data) {
  const chatUser = document.createElement('div');
  chatUser.className = 'chat-user';
  chatUser.id = 'chat-user@' + data['username'];

  const onlineDot = document.createElement('span');
  onlineDot.className = 'float-left online-dot';
  onlineDot.id = 'online-dot';
  onlineDot.style.visibility = data['isOnline'] === true ? 'visible' : 'hidden';
  chatUser.appendChild(onlineDot);

  const chatAvatar = document.createElement('img');
  chatAvatar.className = 'chat-avatar';
  chatAvatar.src = '/assets/img/avatar-default-icon.png';
  chatAvatar.alt = '';
  chatUser.appendChild(chatAvatar);

  const chatUserName = document.createElement('div');
  chatUserName.className = 'chat-user-name';

  const username = document.createElement('a');
  username.innerText = data['username'];
  username.href = '#';
  chatUserName.appendChild(username);

  const statusIcon = document.createElement('img');
  statusIcon.className = 'float-right status-icon';
  statusIcon.src = imgMap[data['status']];
  statusIcon.style.visibility
    = data['status'] === undefined ? 'hidden' : 'visible';
  chatUserName.appendChild(statusIcon);
  chatUser.appendChild(chatUserName);

  const list = document.getElementById('users-list');
  list.appendChild(chatUser);
  list.scrollTop = list.scrollHeight;
}

function updateChatUserIsOnline(username, isOnline) {
  const chatUser = document.getElementById('chat-user@' + username);
  if (chatUser === null) {
    appendUserList({ username: username, isOnline: isOnline , status: undefined});
    return;
  }

  const onlineDot = chatUser.firstChild;
  onlineDot.style.visibility = isOnline ? 'visible' : 'hidden';
}

function updateChatUserStatus(username, status) {
  const chatUser = document.getElementById('chat-user@' + username);
  if (chatUser === null) {
    appendUserList({username: username, isOnline: true, status: status});
    return;
  }
  let statusIcon = chatUser.getElementsByClassName('status-icon');
  if (statusIcon.length > 0) {
    statusIcon = statusIcon[0];
    statusIcon.src = imgMap[status];
    statusIcon.style.visibility
      = status === undefined ? 'hidden' : 'visible';
  }
}

let hideDirBtn = document.getElementById('hideDirBtn');
hideDirBtn.onclick = () => {
  onHideDirBtnClick();
};

function onHideDirBtnClick() {
  $('#hideDirBtn').text($('#hideDirBtn').text() == "Hide Directory"?"Show Directory":"Hide Directory"); 
}