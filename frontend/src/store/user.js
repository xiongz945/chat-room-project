import router from '../router.js';

const storage = window.localStorage;

const userActions = {
  loginUser(user) {
    storage.setItem('isLogin', true);
    storage.setItem('user', JSON.stringify(user.user));
    storage.setItem('userJWT', user.token);
    storage.setItem('peerList', JSON.stringify([]));
    storage.setItem('chatMode', 'public');
    storage.setItem('chatPeer', 'none');
  },
  logoutUser() {
    storage.setItem('isLogin', false);
    storage.removeItem('user');
    storage.removeItem('userJWT');
    storage.removeItem('peerList');
    storage.removeItem('chatMode');
    storage.removeItem('chatPeer');
    storage.removeItem('status');
  },
  updateRecentPeer(peer) {
    const peerList = userGetters.peerList();
    if (!peerList.includes(peer)) {
      peerList.push(peer);
      storage.setItem('peerList', JSON.stringify(peerList));
    }
  },
  switchChatMode(mode) {
    storage.setItem('chatMode', mode);
  },
  updateChatPeer(peer) {
    storage.setItem('chatPeer', peer);
  },
  updateStatus(status) {
    storage.setItem('status', status);
  },
};

const userGetters = {
  user: () => JSON.parse(storage.getItem('user')),
  userJWT: () => storage.getItem('userJWT'),
  isLogin: () => storage.getItem('isLogin'),
  peerList: () => JSON.parse(storage.getItem('peerList')),
  chatMode: () => storage.getItem('chatMode'),
  chatPeer: () => storage.getItem('chatPeer'),
  status: () => storage.getItem('status'),
};

export default {
  userActions,
  userGetters,
};
