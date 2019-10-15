import router from '../router.js';

const storage = window.localStorage;

const userActions = {
  loginUser(user) {
    storage.setItem('isLogin', true);
    storage.setItem('user', JSON.stringify(user.user));
    storage.setItem('userJWT', user.token);
  },
  logoutUser() {
    storage.setItem('isLogin', false);
    storage.removeItem('user');
    storage.removeItem('userJWT');
    storage.removeItem('status');
  },
  updateStatus(status) {
    storage.setItem('status', status);
  },
};

const userGetters = {
  user: () => JSON.parse(storage.getItem('user')),
  userJWT: () => storage.getItem('userJWT'),
  isLogin: () => storage.getItem('isLogin'),
  status: () => storage.getItem('status'),
};

export default {
  userActions,
  userGetters,
};
