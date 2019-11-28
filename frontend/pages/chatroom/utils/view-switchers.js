import { clearSearchResult, cleanMessageBoard } from './cleaners.js';
import {
  receivePrivateHistoryMessage,
  receivePublicHistoryMessage,
} from './message-receivers.js';
import userStore from '../../../store/user.js';

export function switchToSearchView() {
  clearSearchResult();
  document.querySelector('.chat-view').hidden = true;
  document.querySelector('.search-view').hidden = false;
  const channel = document.getElementById('chatroom-channel');
  channel.innerText = 'Search Result';
}

export function switchToChatView() {
  document.querySelector('.chat-view').hidden = false;
  document.querySelector('.search-view').hidden = true;
}

export function switchToPrivateChat(peer) {
  switchToChatView();
  userStore.userActions.updateChatPeer(peer);
  userStore.userActions.updateRecentPeer(peer);
  userStore.userActions.switchChatMode('private');

  cleanMessageBoard();
  receivePrivateHistoryMessage();

  const channel = document.getElementById('chatroom-channel');
  channel.innerText = 'Private Channel with ' + peer;
}

export function switchToPublicChat() {
  switchToChatView();
  userStore.userActions.switchChatMode('public');

  cleanMessageBoard();
  receivePublicHistoryMessage();

  const channel = document.getElementById('chatroom-channel');
  channel.innerText = 'Public Chatroom';
}
