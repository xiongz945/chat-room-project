import { SHA256 } from '../../utils/hash.js';
import userApis from '../../apis/user-apis.js';

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
  let data = {
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
    case 'non-existing username': {
      const intended = confirm('Do you want to create a new account?');
      if (!intended) {
        cleanTextBox(username, password);
        break;
      }

      data['confirm'] = true;
      response = await userApis.login(data);
      message = response['data']['message'][0];

      if (message === 'registered') {
        // Show the welcome message.
      } else {
        // Reset the input text boxes.
        alert('Oops! Unexpected result...');
        cleanTextBox(username, password);
      }
      break;
    }
    case 'authenticated':
      window.location.replace('http://localhost:4000/');
      break;
  }
}

let form = document.getElementById('userForm');
form.addEventListener('submit', validateForm, true);
