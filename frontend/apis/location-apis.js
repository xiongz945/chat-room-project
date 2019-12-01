import { get, patch, post } from '../utils/http.js';

export default {
  async postNewLocation(username, data) {
    const res = await post('/location/' + username, data);
    return res;
  },

  async getLocation(id) {
    const res = await get('/location/' + id);
    return res;
  },

  async getAllLocation() {
    const res = await get('/location');
    return res;
  },

  async postNewComment(data) {
    const res = await post('/location/' + username + '/comment', data);
    return res;
  },

  async getHistoryComment(username, data) {
    const res = await get('/location/' + username + '/comment', data);
    return res;
  },
};
