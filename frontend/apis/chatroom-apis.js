import { get, patch, post } from '../utils/http.js';

export default {
  // Get Public Users
  async getPublicUsers() {
    const res = await get('/chat/public/users');
    return res;
  },
};
