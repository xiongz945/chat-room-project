import { get, post } from '../utils/http.js';

export default {
  // Post message to public channel
  async postPublicMessage(data) {
    const res = await post('/messages/public', data);
    return res;
  },

  async postPrivateMessage(receiverName, data) {
    const res = await post('/messages/' + receiverName, data);
    return res;
  },

  // Get message from public channel
  async getPublicMessage(data) {
    const res = await get('/messages/public', data);
    return res;
  },

  // Get message from private channel
  async getPrivateMessage(receiverName, data) {
    const res = await get('/messages/' + receiverName, data);
    return res;
  },

  // Load history message from public channel
  async getPublicHistoryMessage(data) {
    const res = await get('/messages/public/history', data);
    return res;
  },

  // Load history message from private channel
  async getPrivateHistoryMessage(receiverName, data) {
    const res = await get('/messages/' + receiverName + '/history', data);
    return res;
  },

  async postAnnouncement(data) {
    const res = await post('/messages/announcements', data);
    return res;
  },

  async getAnnouncement(data) {
    const res = await get('/messages/announcements', data);
    return res;
  },
};
