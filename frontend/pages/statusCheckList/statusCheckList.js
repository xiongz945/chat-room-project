import { API_ROOT } from '../../config.js';

import messageApis from '../../apis/message-apis.js';
import userApis from '../../apis/user-apis.js';
import statusCheckApis from '../../apis/status-check-apis.js';

import messageStore from '../../store/message.js';
import clockStore from '../../store/clock.js';
import userStore from '../../store/user.js';

import router from '../../router.js';

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

// Init

// UI change based on user login status
if (userStore.userGetters.isLogin) {
  document.getElementById('join-community-button').style.display = 'none';
  document.getElementById('welcome-message').innerText = `Welcome, ${
    userStore.userGetters.user().username
  }!`;
  document.getElementById('logout-button').style.display = 'block';
}

// Set user isOnline field to 'true' when page is ready
setUserIsOnline({ isOnline: true });

// UI Render
function renderStatusCheckList(data) {
  for (let statusCheck of data) {
    const statusCheckElem = document.createElement('tr');

    // <td><i class="fa fa-clock-o"></i> 11:20pm</td>
    // <td>3</td>
    // <td class="text-navy"><a href="#" name="view-detail-button">View Detail</a></td>

    const tdTime = document.createElement('td');
    tdTime.innerHTML = `<i class="fa fa-clock-o"></i> ${statusCheck.createdAt}`;
    statusCheckElem.append(tdTime);

    const userResponses = [];
    const uniqueIds = [];

    for (let response of statusCheck.userResponses) {
      if (!uniqueIds.includes(response.username)) {
        userResponses.push(response);
        uniqueIds.push(response.username);
      }
    }

    const tdCount = document.createElement('td');
    tdCount.innerHTML = `${userResponses.length}`;
    statusCheckElem.append(tdCount);

    const tdViewDetail = document.createElement('td');
    tdViewDetail.innerHTML = `<a href="#" name="view-detail-button">View Detail</a>`;
    tdViewDetail.className = 'text-navy';
    tdViewDetail.addEventListener('click', function(e) {
      showDetailModal(userResponses);
    });
    statusCheckElem.append(tdViewDetail);

    const tbody = document.getElementById('status-check-tbody');
    tbody.appendChild(statusCheckElem);
    // list.scrollTop = list.scrollHeight;
  }
}

function renderStatusCheckDetailList(data) {
  const tbody = document.getElementById('status-check-detail-tbody');
  tbody.innerHTML = '';

  for (let response of data) {
    const responseElem = document.createElement('tr');

    // <td><i class="fa fa-clock-o"></i> 11:20pm</td>
    // <td>3</td>
    // <td class="text-navy"><a href="#" name="view-detail-button">View Detail</a></td>

    const tdUsername = document.createElement('td');
    tdUsername.innerHTML = `${response.username}`;
    responseElem.append(tdUsername);

    const tdStatus = document.createElement('td');
    tdStatus.innerHTML = `${emojiMap[statusMap[response.status]]} ${
      statusMap[response.status]
    }`;
    responseElem.append(tdStatus);

    tbody.appendChild(responseElem);
  }
}

// Bind event listener
document.getElementById('logout-button').onclick = async () => {
  socket.emit('NOTIFY_USER_LOGOUT', userStore.userGetters.user().username);
  await logout();
  window.onbeforeunload = undefined;
  userStore.userActions.logoutUser();
  router('login');
};

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

// Function definations
async function logout() {
  return await userApis.logout();
}

async function setUserStatus(status) {
  return await userApis.patchUserStatus(status);
}

async function setUserIsOnline(isOnline) {
  return await userApis.patchUserIsOnline(isOnline);
}

function closeMenu() {
  const closeMenuBtn = document.querySelector('.close-canvas-menu');
  closeMenuBtn.click();
}

async function fetchStatusCheckData() {
  const statusChecks = (await statusCheckApis.getStatusCheck()).data
    .statusCheck;
  console.log(statusChecks);

  renderStatusCheckList(statusChecks);
}

function showDetailModal(data) {
  console.log(data);
  renderStatusCheckDetailList(data);
  $('#status-check-modal').modal('show');
}

// Fetch status data
fetchStatusCheckData();
