import { get, patch } from '../utils/http.js';

export default {
  async getUserProfile() {
    return await get('/administration/user');
  },
  async updateUserProfile(data) {
    return await patch('/administration/user', data);
  },
};