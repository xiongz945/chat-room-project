import userStore from '../../store/user.js';
import { SHA256 } from '../../utils/hash.js';
import { API_ROOT } from '../../config.js';
import administrationApis from '../../apis/administration-apis.js';
import userApis from '../../apis/user-apis.js';
import router from '../../router.js';

const socket = io(API_ROOT);

socket.on('UPDATE_CHATROOM', async function(data) {
  console.log('UPDATE_CHATROOM');
  if (userStore.userGetters.user().username === data['oldUsername']) {
    socket.emit('NOTIFY_USER_LOGOUT', data['newUsername']);
    await userApis.logout();
    window.onbeforeunload = undefined;
    userStore.userActions.logoutUser();
    router('login');
  } else {
    location.reload();
  }
});

if (userStore.userGetters.isLogin()) {
  document.getElementById('join-community-button').style.display = 'none';
  document.getElementById('welcome-message').innerText = `Welcome, ${
    userStore.userGetters.user().username
  }!`;
}

getUserProfile();

document
  .querySelector('#update-profile-form')
  .addEventListener('submit', submitUpdateProfileFormListener, true);

async function getUserProfile() {
  const resp = await administrationApis.getUserProfile();
  const users = resp['data']['users'];
  updateUserProfileTable(users);
  document
    .querySelectorAll('.update-profile-btn')
    .forEach((updateProfileBtn) => {
      updateProfileBtn.addEventListener('click', updateBtnCLickListener);
    });
  return users;
}

function updateUserProfileTable(users) {
  const profileTable = document.querySelector('#profile-table');
  users.forEach((user) => {
    const row = document.createElement('tr');
    row.id = user['_id'];
    const usernameCol = document.createElement('td');
    usernameCol.innerText = user['username'];
    const activeStatusCol = document.createElement('td');
    activeStatusCol.innerText = user['active'] ? 'active' : 'inactive';
    const privilegeLevelCol = document.createElement('td');
    privilegeLevelCol.innerText = user['role'] || 'citizen';
    const updateCol = document.createElement('td');
    const updateBtn = document.createElement('button');
    updateBtn.innerText = 'Update';
    updateBtn.className = 'btn btn-sm btn-primary update-profile-btn';
    updateCol.appendChild(updateBtn);
    row.appendChild(usernameCol);
    row.appendChild(activeStatusCol);
    row.appendChild(privilegeLevelCol);
    row.appendChild(updateCol);
    profileTable.appendChild(row);
  });
}

function updateBtnCLickListener(event) {
  const profileRow = event.srcElement.parentElement.parentElement;
  document.querySelector('#update-profile-form')['user-id'] = profileRow.id;
  document.querySelector('#update-username-input').value =
    profileRow.children[0].innerText;
  document.querySelector('#update-password-input').value = '';
  document.querySelector('#update-account-status-input').value =
    profileRow.children[1].innerText;
  document.querySelector('#update-privilege-level-input').value =
    profileRow.children[2].innerText;
  $('#profile-modal').modal('show');
}

async function submitUpdateProfileFormListener() {
  const userId = document.querySelector('#update-profile-form')['user-id'];
  const updatedProfile = {
    username: document.querySelector('#update-username-input').value,
    active:
      (document.querySelector('#update-account-status-input').value ||
        'active') === 'active',
    role:
      document.querySelector('#update-privilege-level-input').value ||
      'citizen',
  };
  const plainPassword = document.querySelector('#update-password-input').value;
  if (plainPassword) {
    updatedProfile['password'] = SHA256(plainPassword);
  }
  console.log(updatedProfile);
  const resp = await administrationApis.updateUserProfile({
    user_id: userId,
    user: updatedProfile,
  });
  const data = resp['data'];

  socket.emit('NOTIFY_UPDATE_CHATROOM', data);
}
