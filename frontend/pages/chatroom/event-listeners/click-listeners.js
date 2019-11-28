import userStore from '../../../store/user.js';
import { setUserStatus, logout } from '../utils/api-senders.js';
import {
  switchToSearchView,
  switchToPublicChat,
} from '../utils/view-switchers.js';
import { closeMenu } from '../utils/cleaners.js';
import router from '../../../router.js';
import { clearSearchResult } from '../utils/cleaners.js';
import searchApis from '../../../apis/search-apis.js';
import { sendAnnouncement } from '../utils/message-senders.js';
import { statusMap } from '../config.js';
import {
  showSearchResultHeading,
  showSearchUserResults,
  showSearchMessageResults,
  showSearchAnnouncementResults,
} from '../utils/content-showers.js';
import { socket } from '../chatroom.js';

export const shareStatusClickListener = async () => {
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

export const logoutBtnClickListener = async () => {
  socket.emit('NOTIFY_USER_LOGOUT', userStore.userGetters.user().username);
  await logout();
  window.onbeforeunload = undefined;
  userStore.userActions.logoutUser();
  router('login');
};

export const hideDirBtnClickListener = () => {
  $('#hideDirBtn').text(
    $('#hideDirBtn').text() === 'Hide Directory'
      ? 'Show Directory'
      : 'Hide Directory'
  );
};

export const magnifierBtnClickListener = () => {
  switchToSearchView();
};

export const menuChatroomClickListener = () => {
  closeMenu();
  switchToPublicChat();
};

export const searchBtnClickListener = async () => {
  const searchContext = document.querySelector('.search-context-select').value;
  const keyword = document.querySelector('#search-keyword-input').value;
  const query = {
    keyword: keyword,
  };
  let response = null;
  let users = null;
  let messages = null;
  let announcements = null;
  switch (searchContext) {
    case 'username':
    case 'status':
      clearSearchResult();
      response =
        searchContext === 'username'
          ? await searchApis.getSearchUsersByUsername(query)
          : await searchApis.getSearchUsersByStatus(query);
      users = response['data']['users'];
      showSearchResultHeading(users.length, 'User', keyword);
      showSearchUserResults(users);
      break;
    case 'announcement':
      clearSearchResult();
      response = await searchApis.getSearchAnnouncements(query);
      announcements = response['data']['announcement'];
      showSearchResultHeading(announcements.length, 'Announcement', keyword);
      showSearchAnnouncementResults(announcements);
      break;
    case 'public_message':
    case 'private_message':
      clearSearchResult();
      response =
        searchContext === 'public_message'
          ? await searchApis.getSearchPublicMessages(query)
          : await searchApis.getSearchPrivateMessages(query);
      messages = response['data']['messages'];
      showSearchResultHeading(
        messages.length,
        searchContext === 'public_message'
          ? 'Public Messages'
          : 'Private Messages',
        keyword
      );
      showSearchMessageResults(messages);
      break;
  }
};

export const announcementBtnClickListener = async () => {
  swal(
    {
      title: 'Announcement',
      text: 'Post something in the public channel:',
      type: 'input',
      showCancelButton: true,
      closeOnConfirm: false,
      animation: 'slide-from-top',
      confirmButtonColor: '#1ab394',
      inputPlaceholder: 'Post something',
    },
    function(text) {
      if (text === false) return false;

      if (text === '') {
        swal.showInputError('You need to post something!');
        return false;
      }

      swal('Nice!', 'You just announced: ' + text, 'success');
      sendAnnouncement(text);
    }
  );
};
