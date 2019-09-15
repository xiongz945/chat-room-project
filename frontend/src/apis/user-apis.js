import { get, patch, post } from '../utils/http';

export default {
  // User Login
  async login(data) {
    const res = await post('/users/login', data);
    console.log(res);
    return res;
  },
  async register(data) {
    const res = await post('/users/signup', data);
    return res;
  },
  // Get User Info
  async getUserInfo() {
    const res = await get('/users/me');
    return res;
  },
  // Update User Info
  async updateUserInfo(data) {
    const res = await patch('/users/me', data);
    return res;
  },
  // Update User Password
  async updateUserPassword(data) {
    const res = await post('/users/me/password', data);
    return res;
  },
};
