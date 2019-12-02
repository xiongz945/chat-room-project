import { API_ROOT } from '../../config.js';

import userStore from '../../store/user.js';

import { setUserIsOnline, getAllUserInfo } from './utils/api-senders.js';
import {
  shareStatusClickListener,
  logoutBtnClickListener,
  hideDirBtnClickListener,
  magnifierBtnClickListener,
  menuChatroomClickListener,
  searchBtnClickListener,
  announcementBtnClickListener,
} from './event-listeners/click-listeners.js';
import { messageKeypressListener } from './event-listeners/keypress-listeners.js';
import { switchToPrivateChat } from './utils/view-switchers.js';
import {
  receivePublicMessage,
  receivePrivateMessage,
  receiveHistoryAnnouncement,
  receivePublicHistoryMessage,
  receivePrivateHistoryMessage,
} from './utils/message-receivers.js';
import {
  updateAnnouncementBar,
  updateChatUserStatus,
  updateChatUserIsOnline,
} from './utils/content-updaters.js';
import { cleanAndLogout } from '../common/utils.js';

// Set up Socket
export const socket = io(API_ROOT);
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

socket.on('NEW_PREDICTION', function(prediction) {
  document.querySelector('#prediction-time').innerText =
    'Time of Occurrence: ' +
    new Date(prediction['occurred_datetime']).toLocaleString();
  document.querySelector('#prediction-description').innerText =
    'Description: ' + prediction['description'];
  document.querySelector('#prediction-magnitude').innerText =
    'Magnitude: ' + prediction['magnitude'];
  mapboxgl.accessToken =
    'pk.eyJ1IjoiY2FueCIsImEiOiJjazJzbTZ2eGMwbXMyM2JsN3VwZzlpOTIyIn0.M0NE8kywhhrC1pDQ9j_kww';
  const predictionMap = new mapboxgl.Map({
    container: 'prediction-map',
    style: 'mapbox://styles/mapbox/streets-v11',
  });
  predictionMap.on('load', () => {
    const coordinates = [
      prediction['location']['longitude'],
      prediction['location']['latitude'],
    ];
    console.log(coordinates);
    predictionMap.addSource('prediction-coordinates', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: coordinates,
        },
      },
    });
    predictionMap.addLayer({
      id: 'prediction-coordinates',
      source: 'prediction-coordinates',
      type: 'circle',
      paint: {
        'circle-color': 'red',
      },
    });
    predictionMap.jumpTo({
      center: coordinates,
      zoom: 14,
    });
  });
  $('#prediction-modal').modal('show');
});

socket.on('UPDATE_CHATROOM', async function(data) {
  if (userStore.userGetters.user().username === data['oldUsername']) {
    socket.emit('NOTIFY_USER_LOGOUT', data['newUsername']);
    cleanAndLogout();
  } else {
    location.reload();
  }
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
document
  .getElementById('logout-button')
  .addEventListener('click', logoutBtnClickListener);

document
  .getElementById('hideDirBtn')
  .addEventListener('click', hideDirBtnClickListener);

document
  .querySelector('#message')
  .addEventListener('keypress', messageKeypressListener);

document
  .querySelector('#menu-chatroom')
  .addEventListener('click', menuChatroomClickListener);

document
  .querySelector('#shareStatusBtn')
  .addEventListener('click', shareStatusClickListener);

document
  .querySelector('#magnifier-button')
  .addEventListener('click', magnifierBtnClickListener);

document
  .querySelector('#search-button')
  .addEventListener('click', searchBtnClickListener);

document
  .querySelector('#announcement-button')
  .addEventListener('click', announcementBtnClickListener);

// Function definations
function sortUser() {
  // const userListElement = document.getElementById('users-list')
  // const usersList = Array.from(userListElement.childNodes);
  // usersList.sort((a, b) => b.firstElementChild.style.visibility === 'visible' - a.firstElementChild.style.visibility === 'visible')
  // userListElement.innerText = NodeList.from(usersList);
}
