import { API_ROOT } from '../../config.js';
import userStore from '../../store/user.js';
import locationApis from '../../apis/location-apis.js';
import chatroomApis from '../../../apis/chatroom-apis.js';
import userApis from '../../apis/user-apis.js';
import router from '../../router.js';
import { statusMap } from '../chatroom/config.js';
import { shareStatusClickListener } from './listeners/click-listeners.js';

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

if (userStore.userGetters.isLogin) {
  document.getElementById('welcome-message').innerText = `Welcome, ${
    userStore.userGetters.user().username
  }!`;
  document.getElementById('logout-button').style.display = 'block';
} else {
  router('login');
}

document.getElementById('logout-button').onclick = async () => {
  socket.emit('NOTIFY_USER_LOGOUT', userStore.userGetters.user().username);
  await userApis.logout();
  window.onbeforeunload = undefined;
  userStore.userActions.logoutUser();
  router('login');
};

document
  .querySelector('#shareStatusBtn')
  .addEventListener('click', shareStatusClickListener);

// document.querySelector('')

getUserStatus();

receiveAllLocation();

function updateStatusMap(payload) {
  let username = payload['name'];
  let userstatus = payload['status'];
  let userlocation = payload['location'];
  let time = payload['createdAt'];
  let userdesc = payload['desc'];
  let docId = payload['_id'];

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
  let date = new Date(time);
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
  const markBtn = document.createElement('button');
  markBtn.className = 'btn btn-white btn-xs mark-btn';
  markBtn.innerHTML = 'Mark as safe';
  markBtn.id = docId;
  btn_group.append(markBtn);

  social_body.append(btn_group);
  social_avatar.append(media_body);
  social_avatar.append(social_body);
  statusBlock.append(social_avatar);

  const statusBox = document.querySelector('#statusBox');
  statusBox.appendChild(statusBlock);

  if (userstatus === "OK") {
    markBtn.style.visibility = "hidden";
  }
  document.querySelectorAll('.mark-btn').forEach((markBtn) => {
    markBtn.addEventListener('click', markBtnClickListener);
  });

  updateMap(payload);
}

async function receiveAllLocation() {
  try {
    console.log('Trying to receive all locations');
    const response = await locationApis.getAllLocation();
    console.log(response);
    const locations = response['data']['locations'];
    console.log(locations);
    locations.forEach((location) => {
      updateStatusMap(location);
    });
  } catch (e) {
    console.log(e);
  }
}

export async function getUserStatus() {
  try {
    const response = await chatroomApis.getPublicUsers();
    let users = response['data']['users'];

    users.forEach((user) => {
      // display current user's status on the left side menu
      // store current status in local storage
      if (user['username'] === userStore.userGetters.user().username) {
        const status = user['status'];
        userStore.userActions.updateStatus(status ? status : 'undefined');
        document.querySelector('#statusSelect').value = status
          ? Object.keys(statusMap).find((key) => statusMap[key] === status)
          : 'Choose Your Status';
      }
    });
  } catch (e) {
    console.log(e);
  }
}

async function markBtnClickListener(event) {
  const cmtBtn = event.srcElement;
  const docId = cmtBtn.id;
  swal("Thank you!", "You marked the user's status as safe!", "success")
  cmtBtn.style.visibility = "hidden";
  await locationApis.patchStatus(docId);
  setTimeout(() => window.location.reload(), 2000);
}