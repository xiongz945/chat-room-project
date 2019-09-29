import router from '../router.js';

const storage = window.localStorage;

const clockActions = {
  uupdateClock(timestamp) {
    storage.setItem('clock', timestamp);
  }
};

const clockGetters = {
  clock: () => storage.getItem('clock')
};

export default {
  clockActions,
  clockGetters,
};
