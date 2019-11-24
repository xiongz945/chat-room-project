import { get, post, patch } from '../utils/http.js';

export default {
  // Status Check
  async postStatusCheck(data) {
    const res = await post('/statusCheck/', data);
    return res;
  },

  async getStatusCheck() {
    const res = await get('/statusCheck/');
    return res;
  },

  async getStatusCheckbyId(id) {
    const res = await get('/statusCheck/', id);
    return res;
  },

  async patchStatusCheck(data) {
    const res = await patch('/statusCheck/', data);
    return res;
  },
};
