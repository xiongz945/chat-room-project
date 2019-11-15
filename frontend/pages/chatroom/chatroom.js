import { API_ROOT } from '../../config.js';

import router from '../../router.js';

import messageStore from '../../store/message.js';
import clockStore from '../../store/clock.js';
import userStore from '../../store/user.js';

import messageApis from '../../apis/message-apis.js';
import userApis from '../../apis/user-apis.js';
import chatroomApis from '../../apis/chatroom-apis.js';
import searchApis from '../../apis/search-apis.js';

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
if (userStore.userGetters.user())
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

socket.on('USER_LOGIN', async function(username) {
  updateChatUserIsOnline(username, true);
  sortUser();
});

socket.on('USER_LOGOUT', async function(username) {
  updateChatUserIsOnline(username, false);
  sortUser();
});

socket.on('STATUS_UPDATE', function(updateDetails) {
  updateChatUserStatus(updateDetails['username'], updateDetails['status']);
});

socket.on('NEW_ANNOUNCEMENT', function(announcement) {
  updateAnnouncementBar(announcement);
});

socket.on('disconnect', function() {
  console.log('Socket disconnected');
});

// UI change based on user login status
if (userStore.userGetters.isLogin()) {
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

// Load latest announcements
receiveHistoryAnnouncement();

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

document
  .querySelector('#search-button')
  .addEventListener('click', async function(e) {
    const searchContext = document.querySelector('.search-context-select')
      .value;
    const keyword = document.querySelector('#search-keyword-input').value;
    const query = {
      keyword: keyword,
    };
    let response = null;
    let users = null;
    let messages = null;
    let announcements = null;
    switch (searchContext) {
      case 'username':
      case 'status':
        clearSearchResult();
        response =
          searchContext === 'username'
            ? await searchApis.getSearchUsersByUsername(query)
            : await searchApis.getSearchUsersByStatus(query);
        users = response['data']['users'];
        showSearchResultHeading(users.length, 'User', keyword);
        showSearchUserResults(users);
        break;
      case 'announcement':
        clearSearchResult();
        response = await searchApis.getSearchAnnouncements(query);
        announcements = response['data']['announcement'];
        showSearchResultHeading(announcements.length, 'Announcement', keyword);
        showSearchAnnouncementResults(announcements);
        break;
      case 'public_message':
      case 'private_message':
        clearSearchResult();
        response =
          searchContext === 'public_message'
            ? await searchApis.getSearchPublicMessages(query)
            : await searchApis.getSearchPrivateMessages(query);
        messages = response['data']['messages'];
        showSearchResultHeading(
          messages.length,
          searchContext === 'public_message'
            ? 'Public Messages'
            : 'Private Messages',
          keyword
        );
        showSearchMessageResults(messages);
        break;
    }
  });

document.querySelector('#announcement-button').onclick = async () => {
  swal(
    {
      title: 'Announcement',
      text: 'Post something in the public channel:',
      type: 'input',
      showCancelButton: true,
      closeOnConfirm: false,
      animation: 'slide-from-top',
      confirmButtonColor: '#1ab394',
      inputPlaceholder: 'Post something',
    },
    function(text) {
      if (text === false) return false;

      if (text === '') {
        swal.showInputError('You need to post something!');
        return false;
      }

      swal('Nice!', 'You just announced: ' + text, 'success');
      sendAnnouncement(text);
    }
  );
};

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

async function receiveHistoryAnnouncement() {
  try {
    const query = {
      receiverName: 'announcement',
    };

    const response = await messageApis.getAnnouncement(query);
    const announcements = response['data']['announcements'];

    for (let i = announcements.length - 1; i >= 0; --i) {
      updateAnnouncementBar(announcements[i]);
    }
  } catch (e) {
    console.log(e);
  }
}

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

async function sendAnnouncement(text) {
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

async function getAllUserInfo() {
  try {
    const response = await chatroomApis.getPublicUsers();
    let users = response['data']['users'];
    users = users.sort((a, b) => b.isOnline - a.isOnline);

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

  if (data['voice']) {
    messageContent.innerHTML = `<audio controls src="/${
      data['voice']
    }"></audio><br> <b>Converted</b>: ${data['content']}`;
  }

  message.appendChild(messageAuthor);
  message.appendChild(messageStatus);
  message.appendChild(messageDate);
  message.appendChild(messageContent);
  chatMessage.appendChild(message);

  const board = document.getElementById('message-board');
  board.appendChild(chatMessage);
  board.scrollTop = board.scrollHeight;
}

function updateAnnouncementBar(announcement) {
  let content = '';
  if ('content' in announcement) {
    content = announcement['content'];
  } else if ('message' in announcement) {
    content = announcement['message'];
  }

  const announcementBlock = document.createElement('div');
  announcementBlock.className = 'alert alert-warning alert-dismissable';
  announcementBlock.innerHTML =
    content + '<strong>  by ' + announcement['senderName'] + '</strong>';

  const closeButton = document.createElement('button');
  closeButton.className = 'close';
  closeButton.type = 'button';
  closeButton.setAttribute('aria-hidden', 'true');
  closeButton.setAttribute('data-dismiss', 'alert');
  closeButton.innerHTML = '×';
  announcementBlock.append(closeButton);

  const announcementBox = document.querySelector('.ibox-content');
  announcementBox.appendChild(announcementBlock);
}

function sortUser() {
  // const userListElement = document.getElementById('users-list')
  // const usersList = Array.from(userListElement.childNodes);
  // usersList.sort((a, b) => b.firstElementChild.style.visibility === 'visible' - a.firstElementChild.style.visibility === 'visible')
  // userListElement.innerText = NodeList.from(usersList);
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
  document.querySelector('#search-result-list').innerHTML = '';
}

function showSearchResultHeading(
  searchResultNum,
  searchContext,
  searchKeyword
) {
  document.querySelector('#search-result-num').innerText = searchResultNum;
  document.querySelector('#search-result-plural').innerText =
    searchResultNum > 1 ? 's' : '';
  document.querySelector('#search-context').innerText = searchContext;
  document.querySelector('#search-title').innerText = searchKeyword;
  document.querySelector('#search-result-heading').hidden = false;
}

function showSearchUserResults(users) {
  const searchResultList = document.querySelector('#search-result-list');

  users.forEach((user) => {
    const chatUser = document.createElement('div');
    chatUser.className = 'chat-user';

    const onlineDot = document.createElement('span');
    onlineDot.className = 'float-left online-dot';
    onlineDot.id = 'online-dot';
    onlineDot.style.visibility =
      user['isOnline'] === true ? 'visible' : 'hidden';
    chatUser.appendChild(onlineDot);

    const chatAvatar = document.createElement('img');
    chatAvatar.className = 'chat-avatar';
    chatAvatar.src = '/assets/img/avatar-default-icon.png';
    chatAvatar.alt = '';
    chatUser.appendChild(chatAvatar);

    const statusIcon = document.createElement('span');
    statusIcon.className = 'float-right status-icon';
    statusIcon.innerText =
      user['status'] in emojiMap
        ? emojiMap[user['status']]
        : emojiMap[undefined];
    statusIcon.style.visibility =
      user['status'] === undefined ||
      user['status'] === 'undefined' ||
      !(user['status'] in emojiMap)
        ? 'hidden'
        : 'visible';
    chatUser.appendChild(statusIcon);

    const chatUserName = document.createElement('div');
    chatUserName.className = 'chat-user-name';

    const username = document.createElement('a');
    username.className = 'chat-user-name';
    username.innerText = user['username'];
    username.href = '#';
    chatUserName.appendChild(username);

    // Add event listener
    username.addEventListener('click', function(e) {
      switchToPrivateChat(user['username']);
    });

    chatUser.appendChild(chatUserName);
    searchResultList.appendChild(chatUser);
  });
}

function showSearchAnnouncementResults(announcements) {
  const searchResultList = document.querySelector('#search-result-list');

  announcements.forEach((message) => {
    const messageBlock = document.createElement('div');
    messageBlock.className = 'message';

    const messageAuthor = document.createElement('a');
    messageAuthor.className = 'message-author';
    messageAuthor.innerText = message['senderName'];
    messageAuthor.href = '#';
    messageBlock.appendChild(messageAuthor);

    const messageDate = document.createElement('span');
    messageDate.className = 'message-date';
    messageDate.style['float'] = 'right';
    // FIXME: Beautify the datetime.
    messageDate.innerText = 'sent at ' + message['createdAt'];
    messageBlock.appendChild(messageDate);

    const messageContent = document.createElement('span');
    messageContent.className = 'message-content';
    messageContent.innerText = message['content'];
    messageBlock.appendChild(messageContent);

    searchResultList.appendChild(messageBlock);
  });
}

function showSearchMessageResults(messages) {
  const searchResultList = document.querySelector('#search-result-list');

  messages.forEach((message) => {
    const messageBlock = document.createElement('div');
    messageBlock.className = 'message';

    const messageAuthor = document.createElement('a');
    messageAuthor.className = 'message-author';
    messageAuthor.innerText = message['senderName'];
    messageAuthor.href = '#';
    messageBlock.appendChild(messageAuthor);

    const messageStatus = document.createElement('span');
    messageStatus.className = 'message-status';
    messageStatus.innerText =
      message['status'] === undefined ||
      message['status'] === 'undefined' ||
      !(message['status'] in emojiMap)
        ? ''
        : ' ' + emojiMap[message['status']];
    messageBlock.appendChild(messageStatus);

    if ('receiverName' in message) {
      const messageReceiver = document.createElement('span');
      messageReceiver.className = 'message-receiver';
      messageReceiver.innerText = 'to ' + message['receiverName'];
      messageBlock.appendChild(messageReceiver);
    }

    const messageDate = document.createElement('span');
    messageDate.className = 'message-date';
    messageDate.style['float'] = 'right';
    // FIXME: Beautify the datetime.
    messageDate.innerText = 'sent at ' + message['createdAt'];
    messageBlock.appendChild(messageDate);

    const messageContent = document.createElement('span');
    messageContent.className = 'message-content';
    messageContent.innerText = message['content'];
    messageBlock.appendChild(messageContent);

    searchResultList.appendChild(messageBlock);
  });
}
