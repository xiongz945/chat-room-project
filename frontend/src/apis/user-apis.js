import {get, patch, post} from '../utils/http.js';

export default {
  // User Login
  async login(data) {
    const res = await post('/auth/login', data);
    return res;
  },

  // User Logout
  async logout() {
    return await get('/auth/logout');
  },

  async patchUserStatus(status) {
    return await patch('/user/status', status);
  },

  async patchUserIsOnline(isOnline){
    return await patch('/user/isOnline', isOnline);
  },

  // Get User Info
  async getUserProfile() {
    const res = await get('/user/profile');
    return res;
  },

  // Get All User Info
  async getAllUserProfile() {
    const res = await get('/user/profile/all');
    return res;
  },

  // Update User Info
  async updateUserInfo(data) {
    const res = await patch('/user/profile', data);
    return res;
  },

  // Update User Password
  async updateUserPassword(data) {
    const res = await post('/user/password', data);
    return res;
  },

  // Update User Login Status
  async updateLoginStatus() {
    const res = await patch('/users/loginTag');
    return res;
  },
};
