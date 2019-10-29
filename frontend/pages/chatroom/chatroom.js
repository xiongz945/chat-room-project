import { API_ROOT } from '../../config.js';

import messageApis from '../../apis/message-apis.js';
import messageStore from '../../store/message.js';
import clockStore from '../../store/clock.js';

import userStore from '../../store/user.js';
import router from '../../router.js';
import userApis from '../../apis/user-apis.js';
import chatroomApis from '../../apis/chatroom-apis.js';
import searchApis from '../../apis/search-apis.js'

const statusMap = {
  1: 'OK',
  2: 'Help',
  3: 'Emergency',
};

const emojiMap = {
  OK: '✅',
  Help: '⚠️',
  Emergency: '🆘',
  undefined: '✅',
};

// Set up Socket
const socket = io(API_ROOT);
socket.emit('REGISTER', userStore.userGetters.user().username);

socket.on('connect', function() {
  console.log('Socket connected');
});

socket.on('PULL_NEW_MESSAGE', function(id) {
  if (userStore.userGetters.chatMode() == 'public') {
    receivePublicMessage();
  }
});

socket.on('PULL_NEW_PRIVATE_MESSAGE', function(payload) {
  const me = userStore.userGetters.user()['username'];
  const peer = userStore.userGetters.chatPeer();

  if (userStore.userGetters.chatMode() == 'private') {
    if (
      (me === payload.receiverName && peer === payload.senderName) ||
      (peer === payload.receiverName && me === payload.senderName)
    ) {
      receivePrivateMessage(payload);
      return;
    }
  }

  if (me === payload.receiverName) {
    const option = {
      closeButton: true,
      debug: false,
      progressBar: true,
      preventDuplicates: false,
      positionClass: 'toast-top-right',
      showDuration: '400',
      hideDuration: '1000',
      timeOut: '7000',
      extendedTimeOut: '1000',
      showEasing: 'swing',
      hideEasing: 'linear',
      showMethod: 'fadeIn',
      hideMethod: 'fadeOut',
      onclick: function() {
        switchToPrivateChat(payload.senderName);
      },
    };

    toastr.success(
      'Click to check it!',
      `${payload.senderName} just drops a private message`,
      option
    );
  }
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

// Set user isOnline to false when page unloads
/*
window.onbeforeunload = async (e) => {
  await logout();
};
*/

// Set user isOnline field to 'true' when page is ready
setUserIsOnline({ isOnline: true });

document.querySelector('#chatroom-channel').innerText =
  userStore.userGetters.chatMode() === 'public'
    ? 'Public Chatroom'
    : 'Private Channel with ' + userStore.userGetters.chatPeer();

// Load history messages
if (userStore.userGetters.chatMode() === 'public') {
  receivePublicHistoryMessage();
} else {
  receivePrivateHistoryMessage();
}

// Get all users
getAllUserInfo();

// Bind event listener
document.getElementById('logout-button').onclick = async () => {
  socket.emit('NOTIFY_USER_LOGOUT', userStore.userGetters.user().username);
  await logout();
  window.onbeforeunload = undefined;
  userStore.userActions.logoutUser();
  router('login');
};

document.getElementById('hideDirBtn').onclick = () => {
  $('#hideDirBtn').text(
    $('#hideDirBtn').text() == 'Hide Directory'
      ? 'Show Directory'
      : 'Hide Directory'
  );
};

document.querySelector('#message').addEventListener('keypress', function(e) {
  const key = e.which || e.keyCode;
  if (key === 13) {
    // 13 is enter

    if (userStore.userGetters.chatMode() == 'public') {
      sendPublicMessage();
    } else {
      sendPrivateMessage();
    }

    e.preventDefault();
    this.value = '';
  }
});

document.querySelector('#menu-chatroom').addEventListener('click', function(e) {
  closeMenu();
  switchToPublicChat();
});

document.querySelector('#shareStatusBtn').onclick = async () => {
  closeMenu();
  const statusCode = document.getElementById('statusSelect').value;
  if (statusCode in statusMap) {
    const status = statusMap[statusCode];
    // the status remains the same actually
    console.log('update status to ' + status);
    await setUserStatus({ status: status });
    socket.emit('NOTIFY_STATUS_UPDATE', {
      username: userStore.userGetters.user().username,
      status: status,
    });
    userStore.userActions.updateStatus(status);
  }
};

document
  .querySelector('#magnifier-button')
  .addEventListener('click', function(e) {
    switchToSearchView();
  });

document.querySelector('#search-button').addEventListener('click', async function(e) {
  const searchContext = document.querySelector('.search-context-select').value;
  const keyword = document.querySelector('#search-keyword-input').value;
  const query = {
    keyword: keyword
  };
  let response = null;
  switch (searchContext) {
    case 'username':
      response = await searchApis.getSearchUsersByUsername(query);
      showSearchUserResults(response['data']['users']);
      break;
    case 'status':
      response = await searchApis.getSearchUsersByStatus(query);
      showSearchUserResults(response['data']['users']);
      break;
    case 'announcement':
      response = await searchApis.getSearchAnnouncements(query);
      showSearchAnnouncementResults(response['data']['announcements']);
      break;
    case 'public_message':
      response = await searchApis.getSearchPublicMessages(query);
      showSearchMessageResults(response['data']['messages']);
      break;
    case 'private_message':
      response = await searchApis.getSearchPrivateMessages(query);
      showSearchMessageResults(response['data']['messages']);
      break;
  }
});

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

async function receivePrivateHistoryMessage() {
  // FIXME: Decide the number of messages to be loaded.
  const query = {
    start: 0,
    end: 5,
  };

  try {
    const me = userStore.userGetters.user()['username'];
    const peer = userStore.userGetters.chatPeer();

    let messages = [];

    query['senderName'] = me;
    query['receiverName'] = peer;
    let response = await messageApis.getPrivateHistoryMessage(peer, query);
    for (const index in response['data']['messages']) {
      messages.push(response['data']['messages'][index]);
    }

    if (me !== peer) {
      query['senderName'] = peer;
      query['receiverName'] = me;
      response = await messageApis.getPrivateHistoryMessage(me, query);
      for (const index in response['data']['messages']) {
        messages.push(response['data']['messages'][index]);
      }
    }

    messages.sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1));

    for (const index in messages) {
      updateMessageBoard(messages[index]);
    }

    clockStore.clockActions.updateClock(Date.now());
  } catch (e) {
    console.log(e);
  }
}

async function sendPublicMessage() {
  const status = userStore.userGetters.status();
  const newMessage = {
    senderName: userStore.userGetters.user().username,
    message: document.querySelector('#message').value,
    status: status ? status : 'undefined',
  };
  try {
    await messageApis.postPublicMessage(newMessage);
    socket.emit('PUSH_NEW_MESSAGE');
  } catch (e) {
    console.log(e);
  }
}

async function sendPrivateMessage() {
  const peer = userStore.userGetters.chatPeer();
  const status = userStore.userGetters.status();

  const newMessage = {
    senderName: userStore.userGetters.user().username,
    receiverName: peer,
    message: document.querySelector('#message').value,
    status: status ? status : 'undefined',
  };
  try {
    const payload = {
      senderName: userStore.userGetters.user().username,
      receiverName: peer,
      timestamp: Date.now(),
    };
    await messageApis.postPrivateMessage(peer, newMessage);
    socket.emit('PUSH_NEW_PRIVATE_MESSAGE', payload);
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

async function receivePrivateMessage(payload) {
  const query = {
    timestamp: payload.timestamp,
    receiverName: payload.receiverName,
  };

  try {
    const response = await messageApis.getPrivateMessage(
      payload.receiverName,
      query
    );
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

function cleanMessageBoard() {
  const board = document.getElementById('message-board');
  board.innerHTML = '';
}

function closeMenu() {
  const closeMenuBtn = document.querySelector('.close-canvas-menu');
  closeMenuBtn.click();
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

  const messageStatus = document.createElement('span');
  messageStatus.className = 'message-status';
  messageStatus.innerText =
    data['status'] === undefined ||
    data['status'] === 'undefined' ||
    !(data['status'] in emojiMap)
      ? ''
      : ' ' + emojiMap[data['status']];

  const messageDate = document.createElement('span');
  messageDate.className = 'message-date';
  // FIXME: Beautify the datetime.
  messageDate.innerHTML = data['createdAt'];

  const messageContent = document.createElement('span');
  messageContent.className = 'message-content';
  messageContent.innerText = data['content'];

  message.appendChild(messageAuthor);
  message.appendChild(messageStatus);
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

  const statusIcon = document.createElement('span');
  statusIcon.className = 'float-right status-icon';
  statusIcon.innerText =
    data['status'] in emojiMap ? emojiMap[data['status']] : emojiMap[undefined];
  statusIcon.style.visibility =
    data['status'] === undefined ||
    data['status'] === 'undefined' ||
    !(data['status'] in emojiMap)
      ? 'hidden'
      : 'visible';
  chatUser.appendChild(statusIcon);

  const chatUserName = document.createElement('div');
  chatUserName.className = 'chat-user-name';

  const username = document.createElement('a');
  username.className = 'chat-user-name';
  username.innerText = data['username'];
  username.href = '#';
  chatUserName.appendChild(username);

  // Add event listener
  username.addEventListener('click', function(e) {
    switchToPrivateChat(data['username']);
  });

  chatUser.appendChild(chatUserName);

  const list = document.getElementById('users-list');
  list.appendChild(chatUser);
  list.scrollTop = list.scrollHeight;
}

function updateChatUserIsOnline(username, isOnline) {
  const chatUser = document.getElementById('chat-user@' + username);
  if (chatUser === null) {
    appendUserList({
      username: username,
      isOnline: isOnline,
      status: undefined,
    });
    return;
  }

  const onlineDot = chatUser.firstChild;
  onlineDot.style.visibility = isOnline ? 'visible' : 'hidden';
}

function updateChatUserStatus(username, status) {
  const chatUser = document.getElementById('chat-user@' + username);
  if (chatUser === null) {
    appendUserList({ username: username, isOnline: true, status: status });
    return;
  }
  const statusIcon = chatUser.querySelector('.status-icon');
  if (statusIcon) {
    statusIcon.innerText = emojiMap[status];
    statusIcon.style.visibility = status === undefined ? 'hidden' : 'visible';
  }
}

function switchToPublicChat() {
  switchToChatView();
  userStore.userActions.switchChatMode('public');

  cleanMessageBoard();
  receivePublicHistoryMessage();

  const channel = document.getElementById('chatroom-channel');
  channel.innerText = 'Public Chatroom';
}

function switchToPrivateChat(peer) {
  switchToChatView();
  userStore.userActions.updateChatPeer(peer);
  userStore.userActions.updateRecentPeer(peer);
  userStore.userActions.switchChatMode('private');

  cleanMessageBoard();
  receivePrivateHistoryMessage();

  const channel = document.getElementById('chatroom-channel');
  channel.innerText = 'Private Channel with ' + peer;
}

function switchToSearchView() {
  clearSearchResult();
  document.querySelector('.chat-view').hidden = true;
  document.querySelector('.search-view').hidden = false;
  const channel = document.getElementById('chatroom-channel');
  channel.innerText = 'Search Result';
}

function switchToChatView() {
  document.querySelector('.chat-view').hidden = false;
  document.querySelector('.search-view').hidden = true;
}

function clearSearchResult() {
  document.querySelector('#search-result-heading').hidden = true;
  document.querySelector('#search-result_list').innerHTML = '';
}

function showSearchUserResults() {}

function showSearchAnnouncementResults() {}

function showSearchMessageResults() {}