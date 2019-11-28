import { emojiMap } from '../config.js';
import { switchToPrivateChat } from './view-switchers.js';

export function showSearchResultHeading(
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

export function showSearchUserResults(users) {
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

export function showSearchMessageResults(messages) {
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

export function showSearchAnnouncementResults(announcements) {
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
