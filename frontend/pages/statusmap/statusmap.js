import { API_ROOT } from '../../config.js';
import userStore from '../../store/user.js';
import locationApis from '../../apis/location-apis.js';
import userApis from '../../apis/user-apis.js';

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

const socket = io(API_ROOT);
socket.on('connect', function() {
  console.log('Socket connected');
});

socket.on('NEW_LOCATION', function(payload) {
  console.log('New location');
  updateStatusMap(payload);
});

socket.on('disconnect', function() {
  console.log('Socket disconnected');
});

async function setUserStatus(status) {
  return await userApis.patchUserStatus(status);
}

if (userStore.userGetters.isLogin) {
  document.getElementById('welcome-message').innerText = `Welcome, ${
    userStore.userGetters.user().username
  }!`;
  document.getElementById('logout-button').style.display = 'block';
}

document.getElementById('logout-button').onclick = async () => {
  socket.emit('NOTIFY_USER_LOGOUT', userStore.userGetters.user().username);
  await logout();
  window.onbeforeunload = undefined;
  userStore.userActions.logoutUser();
  router('login');
};

function closeMenu() {
  const closeMenuBtn = document.querySelector('.close-canvas-menu');
  closeMenuBtn.click();
}

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

receiveAllLocation();

function updateStatusMap(payload) {
  let username = payload['name'];
  let userstatus = payload['status'];
  let userlocation = payload['location'];
  let userplaceID = payload['placeid'];
  let userdesc = payload['desc'];

  const statusBlock = document.createElement('div');
  statusBlock.className = 'social-feed-box';
  const social_avatar = document.createElement('div');
  social_avatar.className = 'social-avatar';
  const media_body = document.createElement('div');
  media_body.className = 'media-body';

  const userName = document.createElement('a');
  userName.setAttribute('href', '#');
  userName.innerHTML = username + ' - ' + userstatus;

  const locationName = document.createElement('small');
  locationName.innerHTML = userlocation;
  const breakline = document.createElement('br');
  const createTime = document.createElement('small');
  createTime.className = 'text-muted';
  let date = new Date();
  createTime.innerHTML =
    date.toLocaleTimeString() + '-' + date.toLocaleDateString();

  media_body.append(userName);
  media_body.append(locationName);
  media_body.append(breakline);
  media_body.append(createTime);

  const social_body = document.createElement('div');
  social_body.className = 'social-body';
  const para = document.createElement('p');
  para.innerHTML = userdesc;
  social_body.append(para);

  const btn_group = document.createElement('div');
  btn_group.className = 'btn-group';
  const commentBtn = document.createElement('button');
  commentBtn.className = 'btn btn-white btn-xs';
  commentBtn.innerHTML = 'Comment';
  btn_group.append(commentBtn);

  social_body.append(btn_group);
  social_avatar.append(media_body);
  social_avatar.append(social_body);
  statusBlock.append(social_avatar);

  const statusBox = document.querySelector('#statusBox');
  statusBox.appendChild(statusBlock);

  updateMap(payload);
}

async function receiveAllLocation() {
  try {
    const response = await locationApis.getAllLocation();
    const location = response['data']['location'];

    for (let i = location.length - 1; i >= 0; --i) {
      updateStatusMap(location[i]);
    }
  } catch (e) {
    console.log(e);
  }
}
