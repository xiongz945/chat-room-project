import router from '../router.js';

const storage = window.localStorage;

const userActions = {
  loginUser(user) {
    storage.setItem('isLogin', true);
    storage.setItem('user', JSON.stringify(user.user));
    storage.setItem('userJWT', user.token);
    storage.setItem('friendList', JSON.stringify([]));
  },
  logoutUser() {
    storage.setItem('isLogin', false);
    storage.removeItem('user');
    storage.removeItem('userJWT');
    storage.removeItem('friendList');
  },
  appendFriendList(friend) {
    const friendList = userGetters.friendList();
    if (!friendList.includes(friend)) {
      friendList.push(friend);
      storage.setItem('friendList', JSON.stringify(friendList));
    }
  },
};

const userGetters = {
  user: () => JSON.parse(storage.getItem('user')),
  userJWT: () => storage.getItem('userJWT'),
  isLogin: () => storage.getItem('isLogin'),
  friendList: () => JSON.parse(storage.getItem('friendList')),
};

export default {
  userActions,
  userGetters,
};
