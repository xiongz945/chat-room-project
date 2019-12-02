import userStore from '../../../store/user.js';
import {
  sendPublicMessage,
  sendPrivateMessage,
} from '../utils/message-senders.js';

export const messageKeypressListener = (e) => {
  const key = e.which || e.keyCode;
  if (key === 13) {
    // 13 is enter
    const mode = userStore.userGetters.chatMode();
    if (mode === 'public') {
      sendPublicMessage();
    } else if (mode === 'private') {
      sendPrivateMessage();
    }

    if (mode === 'public' || mode === 'private') {
      e.preventDefault();
      e.target.value = '';
    }
  }
};

export const messageClickListener = (e) => {
  e.preventDefault();

  const mode = userStore.userGetters.chatMode();
  if (mode === 'public') {
    sendPublicMessage();
  } else if (mode === 'private') {
    sendPrivateMessage();
  }
  document.querySelector('#message').value = '';
};
