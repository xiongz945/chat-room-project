import userStore from '../../../store/user.js';
import { emojiMap } from '../config.js';
import { switchToPrivateChat } from './view-switchers.js';

export function updateMessageBoard(data) {
  if (data.active === false) return;
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

export function updateAnnouncementBar(announcement) {
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

  const announcementBox = document.querySelector('#announcement-box');
  announcementBox.appendChild(announcementBlock);
}

export function updateChatUserIsOnline(username, isOnline) {
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

export function updateChatUserStatus(username, status) {
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

export function appendUserList(data) {
  // Hide user if user is inactive
  if (data.active === false) return;

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
  username.addEventListener('click', function() {
    switchToPrivateChat(data['username']);
  });

  chatUser.appendChild(chatUserName);

  const list = document.getElementById('users-list');
  list.appendChild(chatUser);
  list.scrollTop = list.scrollHeight;
}
