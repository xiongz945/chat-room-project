import { API_ROOT } from '../../config.js';

import statusCheckApis from '../../apis/status-check-apis.js';

import userStore from '../../store/user.js';
import router from '../../router.js';

const socket = io(API_ROOT);

// Bind event listener
document
  .querySelector('#status-check-button')
  .addEventListener('click', () => confirmBroadcast());

document
  .querySelector('#status-check-confirm-button')
  .addEventListener('click', () => {
    confirmSubmit();
    $('#status-check-modal').modal('hide');
  });

// UI modifications
function confirmBroadcast() {
  swal(
    {
      title: 'Please Confirm',
      text: 'You are going to broadcast status check to everyone online',
      showCancelButton: true,
      closeOnConfirm: false,
      animation: 'pop',
      confirmButtonColor: '#1ab394',
      inputPlaceholder: 'Post something',
    },
    async function(condition) {
      if (condition) {
        swal('Success!', 'Status check broadcasted', 'success');
        await broadcastStatusCheck();
      }
    }
  );
}

// Functions
async function broadcastStatusCheck() {
  const newMessage = {
    senderName: userStore.userGetters.user().username,
  };
  await statusCheckApis.postStatusCheck(newMessage);
  socket.emit('PUSH_NEW_STATUS_CHECK');
}

socket.on('PULL_NEW_STATUS_CHECK', async function() {
  $('#status-check-modal').modal('show');
});

async function confirmSubmit() {
  const status = document.querySelector('input[name="optionsRadios"]:checked')
    .value;

  console.log(status);
  await statusCheckApis.patchStatusCheck({ status });
  $('#status-check-modal').modal('hide');
  socket.emit('NOTIFY_STATUS_UPDATE', {
    username: userStore.userGetters.user().username,
    status: status,
  });
  userStore.userActions.updateStatus(status);
}
