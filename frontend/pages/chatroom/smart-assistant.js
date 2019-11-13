import { API_ROOT } from '../../config.js';

import smartAssistantApis from '../../apis/smart-assistant-apis.js';
import messageStore from '../../store/message.js';
import clockStore from '../../store/clock.js';

import userStore from '../../store/user.js';
import router from '../../router.js';
import userApis from '../../apis/user-apis.js';
import chatroomApis from '../../apis/chatroom-apis.js';
import searchApis from '../../apis/search-apis.js';

// Resolve the current geolocation.
navigator.geolocation.getCurrentPosition(function(position) {
  userStore.userActions.setLatitude(position.coords.latitude);
  userStore.userActions.setLongtitude(position.coords.longitude);
});

// Register the element event callbacks.
document
  .querySelector('#smart-assistant-on')
  .addEventListener('click', function(e) {
    const icon = document.querySelector('#smart-assistant-icon');
    icon.style.visibility = 'visible';
  });

document
  .querySelector('#smart-assistant-off')
  .addEventListener('click', function(e) {
    const icon = document.querySelector('#smart-assistant-icon');
    icon.style.visibility = 'hidden';
  });

document
  .querySelector('#smart-assistant-icon')
  .addEventListener('click', function(e) {
    switchToSmartAssistantChat();
  });

document.querySelector('#message').addEventListener('keypress', function(e) {
  const key = e.which || e.keyCode;
  if (key === 13) {
    // 13 is enter

    if (userStore.userGetters.chatMode() == 'smart-assistant') {
      sendRequest();
    }

    e.preventDefault();
    this.value = '';
  }
});

// Functions which manipulate UI components
function cleanMessageBoard() {
  const board = document.getElementById('message-board');
  board.innerHTML = '';
}

function switchToChatView() {
  document.querySelector('.chat-view').hidden = false;
  document.querySelector('.search-view').hidden = true;
}

function switchToSmartAssistantChat() {
  switchToChatView();
  userStore.userActions.switchChatMode('smart-assistant');

  cleanMessageBoard();

  const channel = document.getElementById('chatroom-channel');
  channel.innerText = 'Smart Assistant Consultation Service';
}

function showSuggestionDetail() {
  console.log('Show Detail');
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

  if (data['senderName'] === 'smart-assistant') {
    messageAvatar.src = '/assets/img/ambulance-pretty.svg';
  } else {
    messageAvatar.src = '/assets/img/avatar-default-icon.png';
  }

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
  messageDate.innerHTML = data['createdAt'];

  const messageContent = document.createElement('span');
  messageContent.className = 'message-content';
  messageContent.innerText = data['content'];

  if (data['senderName'] === 'smart-assistant') {
    const suggestionDetail = document.createElement('a');
    suggestionDetail.className = 'suggestion-detail';
    suggestionDetail.innerText = '    Check Hospitals';
    suggestionDetail.href = '#';
    messageContent.appendChild(suggestionDetail);

    suggestionDetail.addEventListener('click', function(e) {
      showSuggestionDetail();
    });
  }

  message.appendChild(messageAuthor);
  message.appendChild(messageDate);
  message.appendChild(messageContent);
  chatMessage.appendChild(message);

  const board = document.getElementById('message-board');
  board.appendChild(chatMessage);
  board.scrollTop = board.scrollHeight;
}

// Functions which communicate with the backend
async function sendRequest() {
  try {
    const request = {
      senderName: userStore.userGetters.user().username,
      message: document.querySelector('#message').value,
      location:
        userStore.userGetters.longtitude() +
        ',' +
        userStore.userGetters.latitude(),
      status: 'undefined',
    };

    await smartAssistantApis.postRequest(request);

    const rep = await smartAssistantApis.getResponse({
      senderName: userStore.userGetters.user().username,
      receiverName: 'smart-assistant',
    });
    updateMessageBoard(rep['data']['messages'][0]);

    const resp = await smartAssistantApis.getResponse({
      senderName: 'smart-assistant',
      receiverName: userStore.userGetters.user().username,
    });
    updateMessageBoard(resp['data']['messages'][0]);
  } catch (e) {
    console.log(e);
  }
}
