import { get, patch, post } from '../utils/http.js';

export default {
  // Post Earthquake Report
  async postEarthquakeReport(data) {
    return await post('/earthquake/report', data);
  },
};
