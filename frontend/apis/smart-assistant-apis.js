import { get, post } from '../utils/http.js';

export default {
  async postRequest(data) {
    const res = await post('/smart-assistant', data);
    return res;
  },

  async getResponse(data) {
    const res = await get('/smart-assistant', data);
    return res;
  },
};
