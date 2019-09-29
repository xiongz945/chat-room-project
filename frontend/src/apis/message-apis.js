import { get, post } from '../utils/http.js';

export default {
  // Post message to public channel
  async postPublicMessage(data) {
    const res = await post('/messages/public', data);
    return res;
  },

  // Get message from public channel
  async getPublicMessage(data) {
    const res = await get('/messages/public', data);
    return res;
  },

  // Load history message from public channel
  async getPublicHistoryMessage(data) {
    const res = await get('/messages/public/history', data);
    return res;
  },
};
