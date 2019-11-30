import userStore from '../../store/user.js';
import administrationApis from '../../apis/administration-apis.js';

if (userStore.userGetters.isLogin()) {
  document.getElementById('join-community-button').style.display = 'none';
  document.getElementById('welcome-message').innerText = `Welcome, ${
    userStore.userGetters.user().username
  }!`;
  document.getElementById('logout-button').style.display = 'block';
}

getUserProfile();

async function getUserProfile() {
  const resp = await administrationApis.getUserProfile();
  const users = resp['data']['users'];
  console.log(users);
  updateUserProfileTable(users);
  return users;
}

function updateUserProfileTable(users) {
  const profileTable = document.querySelector('#profile-table');
  users.forEach((user) => {
    const row = document.createElement('tr');
    const usernameCol = document.createElement('td');
    usernameCol.innerText = user['username'];
    const activeStatusCol = document.createElement('td');
    activeStatusCol.innerText = 'active' in user ? user['active'] : true;
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
