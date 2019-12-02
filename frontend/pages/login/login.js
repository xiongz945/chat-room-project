import { SHA256 } from '../../utils/hash.js';
import userApis from '../../apis/user-apis.js';
import route from '../../router.js';
import userStore from '../../store/user.js';

function cleanTextBox(username, password) {
  username.value = '';
  password.value = '';
}

function resetHelpMessages(usernameMessage, passwordMessage) {
  usernameMessage.innerHTML = '';
  passwordMessage.innerHTML = '';
}

function cleanTextBoxAndShowHelpMessage(
  username,
  password,
  helpMessage,
  content
) {
  cleanTextBox(username, password);
  helpMessage.innerHTML = content;
}

async function validateForm(event) {
  event.preventDefault();

  let username = document.getElementById('username');
  let password = document.getElementById('password');
  let usernameMessage = document.getElementById('usernameMessage');
  let passwordMessage = document.getElementById('passwordMessage');
  resetHelpMessages(usernameMessage, passwordMessage);

  const passwordHash = SHA256(password.value);
  const data = {
    username: username.value,
    password: passwordHash,
  };

  let response = await userApis.login(data);
  let message = response['data']['message'][0];

  switch (message) {
    case 'invalid username length':
      cleanTextBoxAndShowHelpMessage(
        username,
        password,
        usernameMessage,
        'Please lengthen this text to 3 characters or more.'
      );
      break;
    case 'invalid password length':
      cleanTextBoxAndShowHelpMessage(
        username,
        password,
        passwordMessage,
        'Please lengthen this text to 4 characters or more.'
      );
      break;
    case 'reserved username':
      cleanTextBoxAndShowHelpMessage(
        username,
        password,
        usernameMessage,
        'This username is reserved. Please change it.'
      );
      break;
    case 'invalid password':
      cleanTextBoxAndShowHelpMessage(
        username,
        password,
        passwordMessage,
        'This password is wrong. Please correct it.'
      );
      break;
    case 'user is inactive':
      cleanTextBoxAndShowHelpMessage(
        username,
        password,
        passwordMessage,
        'This user is inactive.'
      );
      break;
    case 'non-existing username': {
      swal(
        {
          title: "We didn't recongize this username",
          text: 'Do you want to create a new account?',
          type: 'info',
          showCancelButton: true,
          confirmButtonColor: '#1ab394',
          confirmButtonText: 'Yes, create it!',
          closeOnConfirm: true,
          closeOnCancel: true,
        },
        async function(isConfirm) {
          if (isConfirm) {
            data['confirm'] = true;
            response = await userApis.login(data);
            message = response['data']['message'][0];

            if (message === 'registered') {
              // User dadta returned
              $('#myModal').modal('show');
              userStore.userActions.loginUser(response.data);
            } else {
              swal({
                title: '',
                text: 'Oops! Unexpected result...',
                type: 'warning',
                showCancelButton: false,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Ok',
                closeOnConfirm: true,
              });
              cleanTextBox(username, password);
            }
          } else {
            cleanTextBox(username, password);
            swal('Cancelled', 'No new user created.', 'warning');
          }
        }
      );
      break;
    }
    case 'authenticated':
      userStore.userActions.loginUser(response.data);
      route('chatroom');
      break;
  }
}

let form = document.getElementById('userForm');
form.addEventListener('submit', validateForm, true);

let acknowledgeBtn = document.getElementById('acknowledgeBtn');
acknowledgeBtn.onclick = () => {
  onAcknowledgeBtnClick();
};

function onAcknowledgeBtnClick() {
  $('#myModal').modal('hide');
  // Should return to the home page
  route('chatroom');
}
