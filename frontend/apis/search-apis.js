import { get, post } from '../utils/http.js';

export default {
  async getSearchUsersByUsername(data) {
    return await get('/search/users/username', data);
  },

  async getSearchUsersByStatus(data) {
    return await get('/search/users/status', data);
  },

  async getSearchAnnouncements(data) {
    return await get('/search/announcements', data);
  },

  async getSearchPublicMessages(data) {
    return await get('/search/messages/public', data);
  },

  async getSearchPrivateMessages(data) {
    return await get('/search/messages/private', data);
  },
};
