import userApi from '@/apis/user-apis';
import router from '@/routers';
import * as types from '../mutations';

// initial state
const state = {
  // Login status
  isLogin: false,
  loginFailMsg: undefined,
  registerFailMsg: undefined,

  // User info
  user: undefined,
  userToken: undefined,
};

const getters = {
  isLogin(state) {
    return state.isLogin;
  },
  loginFailMsg(state) {
    return state.loginFailMsg;
  },
  registerFailMsg(state) {
    return state.registerFailMsg;
  },
  userToken(state) {
    return state.userToken || '';
  },
  user(state) {
    return state.user || undefined;
  },
  username(state) {
    if (state.user) return `${state.user.firstName} ${state.user.lastName}`;
    return '';
  },
};

// actions
const actions = {
  // Auth
  async login({ commit }, formData) {
    const res = await userApi.login(formData);
    if (res.status === 200) {
      commit(types.LOGIN, res.data.user);
      router.push({ name: 'ChatroomHome' });
    } else commit(types.LOGIN_FAILED, res.data);
  },
  async register({ commit }, formData) {
    const res = await userApi.register(formData);
    if (res.status === 200) {
      commit(types.REGISTER, res.data.user);
      router.push({ name: 'ChatroomHome' });
    } else commit(types.REGISTER_FAILED, res.data);
  },
  logout({ commit }) {
    commit(types.LOGOUT);
  },

  // Update Data
  async updateMe({ commit }, formData) {
    const { code } = await userApi.updateUserInfo(formData);
    if (code === '200') {
      commit(types.UPDATE_ME, formData);
    }
  },
  async updatePassword({ commit }, formData) {
    const { code } = await userApi.updateUserPassword(formData);
    if (code === '200') {
      commit(types.UPDATE_ME, formData);
    }
  },
};

// mutations
const mutations = {
  // auth
  [types.LOGIN](state, res) {
    state.userToken = res.token;
    state.isLogin = true;
    state.user = res;
    state.loginFailMsg = undefined;
  },
  [types.LOGIN_FAILED](state, res) {
    state.isLogin = false;
    state.loginFailMsg = res.err || '';
  },
  [types.REGISTER](state, res) {
    state.userToken = res.token;
    state.isLogin = true;
    state.user = res;
    state.registerFailMsg = undefined;
  },
  [types.REGISTER_FAILED](state, res) {
    state.isLogin = false;
    console.log('REGISTER_FAILED', res.err);
    state.registerFailMsg = res.err || '';
  },
  [types.LOGOUT](state) {
    state.isLogin = false;
    state.user = undefined;
    state.userToken = '';
    localStorage.removeItem('livechat');
    router.push({ name: 'Login' });
  },

  // Load user data
  [types.GET_ME](state, res) {
    state.user = res;
  },
  [types.UPDATE_ME](state, res) {
    state.user = { ...state.user, ...res };
  },
};
export default {
  state,
  getters,
  actions,
  mutations,
};
