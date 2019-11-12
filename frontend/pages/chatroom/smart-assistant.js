import { API_ROOT } from '../../config.js';

import messageApis from '../../apis/message-apis.js';
import messageStore from '../../store/message.js';
import clockStore from '../../store/clock.js';

import userStore from '../../store/user.js';
import router from '../../router.js';
import userApis from '../../apis/user-apis.js';
import chatroomApis from '../../apis/chatroom-apis.js';
import searchApis from '../../apis/search-apis.js';

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
  userStore.userActions.switchChatMode('private');

  cleanMessageBoard();

  const channel = document.getElementById('chatroom-channel');
  channel.innerText = 'Smart Assistant Consultation Service';
}
