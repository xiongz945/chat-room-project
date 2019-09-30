import { get, patch, post } from '../utils/http.js';

export default {
  // User Login
  async login(data) {
    const res = await post('/auth/login', data);
    console.log(res);
    return res;
  },

  // User Logout
  async logout(){
    const res = await get('/auth/logout');
    console.log(res);
    return res;
  },

  // Get User Info
  async getUserProfile() {
    const res = await get('/user/profile');
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
