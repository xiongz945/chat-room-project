import {get, patch, post} from '../utils/http.js';

export default {
  // User Login
  async login(data) {
    return await post('/auth/login', data);
  },

  // User Logout
  async logout() {
    return await get('/auth/logout');
  },

  async patchUserStatus(status) {
    return await patch('/user/me/status', status);
  },

  async patchUserIsOnline(isOnline){
    return await patch('/user/me/isOnline', isOnline);
  },

  // Get User Info
  async getUserProfile() {
    return await get('/user/me/profile');
  },

  // Update User Info
  async updateUserInfo(data) {
    const res = await patch('/user/me/profile', data);
    return res;
  },

  // Update User Password
  async updateUserPassword(data) {
    const res = await post('/user/me/password', data);
    return res;
  },

};
