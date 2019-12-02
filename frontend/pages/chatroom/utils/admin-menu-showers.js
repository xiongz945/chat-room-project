import userStore from '../../../store/user.js';

// Display earthquake prediction menu when the user is coordinator
if (
  ['coordinator', 'administrator'].includes(userStore.userGetters.user().role)
) {
  document.querySelector(
    '#menu-prediction'
  ).parentElement.parentElement.hidden = false;
}

if (userStore.userGetters.user().role === 'administrator') {
  document.querySelector(
    '#menu-administration'
  ).parentElement.parentElement.hidden = false;
}
